from lexer import Lexer
from parser import Parser
import sys
import subprocess
import llvmlite.ir as ir
import llvmlite.binding as llvm

# Initialize LLVM
llvm.initialize_native_target()
llvm.initialize_native_asmprinter()

class Compiler:
    def __init__(self):
        self.module = ir.Module(name="jovanlang")
        self.module.triple = "wasm32-unknown-unknown"
        
        # Declare external print functions (Imports from JS)
        # void print_num(double)
        self.print_num_type = ir.FunctionType(ir.VoidType(), [ir.DoubleType()])
        self.print_num_func = ir.Function(self.module, self.print_num_type, name="print_num")
        
        # void print_str(i8*)
        self.print_str_type = ir.FunctionType(ir.VoidType(), [ir.IntType(8).as_pointer()])
        self.print_str_func = ir.Function(self.module, self.print_str_type, name="print_str")

        # Main entry point
        self.main_func = ir.Function(self.module, ir.FunctionType(ir.VoidType(), []), name="main")
        self.block = self.main_func.append_basic_block(name="entry")
        self.builder = ir.IRBuilder(self.block)
        
        # Scopes: List of dicts {name: ptr}
        self.scopes = [{}] 
        self.functions = {} # name to ir.Function

        self.double = ir.DoubleType()
        self.bool = ir.IntType(1)
        self.char_ptr = ir.IntType(8).as_pointer()

    def get_var(self, name):
        # Look in local scope first, then global
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        raise ValueError(f"Undefined variable '{name}'")

    def compile(self, ast):
        for node in ast:
            self.visit(node)
        self.builder.ret_void()
        return str(self.module)

    def visit(self, node):
        if node[0] == 'ASSIGN':   self.visit_assign(node)
        elif node[0] == 'IF':     self.visit_if(node)
        elif node[0] == 'FOR':    self.visit_for(node)
        elif node[0] == 'FUNC':   self.visit_func_def(node)
        elif node[0] == 'PRINT':  self.visit_print(node)
        elif node[0] == 'RETURN': self.visit_return(node)
        elif node[0] == 'CALL':   return self.visit_call(node)
        elif node[0] == 'BINOP':  return self.visit_binop(node)
        elif node[0] == 'NUM':    return ir.Constant(self.double, node[1])
        elif node[0] == 'BOOL':   return ir.Constant(self.bool, 1 if node[1] else 0)
        elif node[0] == 'STR':    return self.visit_string_literal(node[1])
        elif node[0] == 'VAR':
            ptr = self.get_var(node[1])
            return self.builder.load(ptr, name=node[1])

    def visit_assign(self, node):
        name = node[1]
        val = self.visit(node[2])
        
        # Check if variable exists in current scope
        if name not in self.scopes[-1]:
            # Allocate Memory
            ptr = self.builder.alloca(val.type, name=name)
            self.scopes[-1][name] = ptr
        else:
            ptr = self.scopes[-1][name]
            
        self.builder.store(val, ptr)

    def visit_string_literal(self, s):
        # Create a constant global byte array
        s_bytes = bytearray(s.encode("utf8")) + b'\0'
        c_str_val = ir.Constant(ir.ArrayType(ir.IntType(8), len(s_bytes)), s_bytes)
        
        global_str = ir.GlobalVariable(self.module, c_str_val.type, name=f"str_{len(self.module.globals)}")
        global_str.linkage = 'internal'
        global_str.global_constant = True
        global_str.initializer = c_str_val
        
        # Cast [N x i8]* to i8*
        return self.builder.bitcast(global_str, self.char_ptr)

    def visit_print(self, node):
        val = self.visit(node[1])
        # Detect type to call correct print
        if val.type == self.double:
            self.builder.call(self.print_num_func, [val])
        elif val.type == self.char_ptr:
            self.builder.call(self.print_str_func, [val])
        elif val.type == self.bool:
            # Cast bool to double for printing (1.0 or 0.0)
            d_val = self.builder.uitofp(val, self.double)
            self.builder.call(self.print_num_func, [d_val])

    def visit_if(self, node):
        cond_raw = self.visit(node[1])
        # Ensure condition is bool
        if cond_raw.type == self.double:
            cond = self.builder.fcmp_ordered('!=', cond_raw, ir.Constant(self.double, 0.0))
        else:
            cond = cond_raw

        with self.builder.if_then(cond):
            for stmt in node[2]:
                self.visit(stmt)

    def visit_for(self, node):
        loop_var_name = node[1]
        start_val = self.visit(node[2])
        end_val = self.visit(node[3])
        step_val = self.visit(node[4])
        body = node[5]

        # Allocate loop variable
        loop_ptr = self.builder.alloca(self.double, name=loop_var_name)
        self.builder.store(start_val, loop_ptr)
        self.scopes[-1][loop_var_name] = loop_ptr

        # Loop Blocks
        cond_block = self.builder.append_basic_block("for_cond")
        body_block = self.builder.append_basic_block("for_body")
        after_block = self.builder.append_basic_block("for_after")

        self.builder.branch(cond_block)

        # Condition
        self.builder.position_at_start(cond_block)
        curr = self.builder.load(loop_ptr)
        # Assuming generic "less than" loop for now
        cond = self.builder.fcmp_ordered('<', curr, end_val)
        self.builder.cbranch(cond, body_block, after_block)

        # Body
        self.builder.position_at_start(body_block)
        for stmt in body:
            self.visit(stmt)
        
        # Step
        curr_2 = self.builder.load(loop_ptr)
        next_val = self.builder.fadd(curr_2, step_val)
        self.builder.store(next_val, loop_ptr)
        self.builder.branch(cond_block)

        # After
        self.builder.position_at_start(after_block)

    def visit_func_def(self, node):
        name = node[1]
        arg_name = node[2]
        body = node[3]

        # Define Function
        # Assuming double so we use double for simplicity
        f_type = ir.FunctionType(ir.DoubleType(), [ir.DoubleType()])
        func = ir.Function(self.module, f_type, name=name)
        self.functions[name] = func

        # Save previous builder/block to restore later
        prev_builder = self.builder
        
        # Start Function Context
        block = func.append_basic_block(name="entry")
        self.builder = ir.IRBuilder(block)
        
        # Push new scope
        self.scopes.append({})
        
        # Register argument
        arg = func.args[0]
        arg.name = arg_name
        arg_ptr = self.builder.alloca(self.double, name=arg_name)
        self.builder.store(arg, arg_ptr)
        self.scopes[-1][arg_name] = arg_ptr

        # Compile Body
        for stmt in body:
            self.visit(stmt)
        
        # Default Return 0.0 if none
        if not block.is_terminated:
            self.builder.ret(ir.Constant(self.double, 0.0))

        # Restore Scope and Builder
        self.scopes.pop()
        self.builder = prev_builder

    def visit_return(self, node):
        val = self.visit(node[1])
        self.builder.ret(val)

    def visit_call(self, node):
        name = node[1]
        arg = self.visit(node[2])
        if name in self.functions:
            return self.builder.call(self.functions[name], [arg])
        raise ValueError(f"Function {name} not found")

    def visit_binop(self, node):
        op = node[1]
        lhs = self.visit(node[2])
        rhs = self.visit(node[3])
        
        # Math
        if op == '+': return self.builder.fadd(lhs, rhs)
        if op == '-': return self.builder.fsub(lhs, rhs)
        if op == '*': return self.builder.fmul(lhs, rhs)
        if op == '/': return self.builder.fdiv(lhs, rhs)
        
        # Comparisons (Returns i1, 1-bit boolean)
        if op == '<':  return self.builder.fcmp_ordered('<', lhs, rhs)
        if op == '>':  return self.builder.fcmp_ordered('>', lhs, rhs)
        if op == '==': return self.builder.fcmp_ordered('==', lhs, rhs)
        if op == '>=': return self.builder.fcmp_ordered('>=', lhs, rhs)
        if op == '<=': return self.builder.fcmp_ordered('<=', lhs, rhs)

# Main Driver works with CLI
def compile_source(source_code, output_filename):
    # 1. Lexing
    lexer = Lexer(source_code)
    tokens = lexer.tokenize()

    # 2. Parsing
    parser = Parser(tokens)
    ast = parser.parse()

    # 3. Compiling
    compiler = Compiler()
    llvm_ir = compiler.compile(ast)
    
    # Generate unique intermediate file names based on output filename
    # e.g. if output is "123.wasm", temp is "123.ll"
    temp_ll_file = output_filename.replace(".wasm", ".ll")
    temp_obj_file = output_filename.replace(".wasm", ".o")

    with open(temp_ll_file, "w") as f:
        f.write(llvm_ir)
    
    # 4. Building WASM
    try:
        # Compile IR to Object file
        subprocess.run(["llc", "-march=wasm32", "-filetype=obj", temp_ll_file, "-o", temp_obj_file], check=True)
        
        # Link to WASM
        subprocess.run(["wasm-ld", "--no-entry", "--export-all", "--allow-undefined", temp_obj_file, "-o", output_filename], check=True)
        
        # Clean up temp files
        subprocess.run(["rm", temp_ll_file, temp_obj_file])
        
    except Exception as e:
        # Print error to stderr so the backend picks it up
        print(f"Build Failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Usage: python3 compiler.py <input_file_path> <output_file_path>
    if len(sys.argv) < 3:
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        with open(input_path, 'r') as f:
            code = f.read()
        compile_source(code, output_path)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

# Test script example
full_test_code = """
print("Starting Program...")

x = 10
y = 20

print("Testing Math:")
res = x + y
print(res)

print("Testing Logic:")
ifvan(x < y):
    print("X is smaller")

ifvan(x > y):
    print("X is bigger")

print("Testing Loop:")
forvan(i=0, 5, 1):
    print(i)

print("Testing Functions:")
funcvan addOne(v):
    return v + 1

z = addOne(99)
print(z)

print("Done")
"""