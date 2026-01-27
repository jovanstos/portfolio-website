class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def consume(self, type_):
        token = self.current()
        if token and token[0] == type_:
            self.pos += 1
            return token[1]
        raise SyntaxError(f"Expected {type_}, got {token}")

    def parse(self):
        statements = []
        while self.current():
            if self.current()[0] in ('NEWLINE', 'DEDENT', 'INDENT'):
                self.pos += 1
                continue
            statements.append(self.statement())
        return statements

    def statement(self):
        token = self.current()
        
        if token[0] == 'KEYWORD':
            if token[1] == 'funcvan':
                return self.function_def()
            if token[1] == 'ifvan':
                return self.if_statement()
            if token[1] == 'forvan':
                return self.for_loop()
            if token[1] == 'return':
                self.consume('KEYWORD')
                val = self.expression()
                return ('RETURN', val)
            if token[1] == 'print':
                return self.print_statement()

        if token[0] == 'ID':
            if self.pos + 1 < len(self.tokens) and self.tokens[self.pos+1][0] == 'EQUALS':
                return self.assignment()
            return self.expression()
            
        return self.expression()

    def function_def(self):
        self.consume('KEYWORD') # funcvan
        name = self.consume('ID')
        self.consume('LPAREN')
         # Single arguments only
        arg_name = self.consume('ID')
        self.consume('RPAREN')
        self.consume('COLON')
        self.consume('NEWLINE')
        self.consume('INDENT')
        body = self.block()
        self.consume('DEDENT')
        return ('FUNC', name, arg_name, body)

    def if_statement(self):
        self.consume('KEYWORD') # ifvan
        self.consume('LPAREN')
        cond = self.expression()
        self.consume('RPAREN')
        self.consume('COLON')
        self.consume('NEWLINE')
        self.consume('INDENT')
        body = self.block()
        self.consume('DEDENT')
        return ('IF', cond, body)

    def for_loop(self):
        # forvan(i=0, 10, 1):
        self.consume('KEYWORD') # forvan
        self.consume('LPAREN')
        
        # Parse: i=0
        loop_var = self.consume('ID')
        self.consume('EQUALS')
        start_val = self.expression()
        
        self.consume('COMMA')
        end_val = self.expression()
        
        self.consume('COMMA')
        # Handle explicitly signed step like +1 or -1
        step_val = self.expression()
        
        self.consume('RPAREN')
        self.consume('COLON')
        self.consume('NEWLINE')
        self.consume('INDENT')
        body = self.block()
        self.consume('DEDENT')
        
        return ('FOR', loop_var, start_val, end_val, step_val, body)

    def print_statement(self):
        self.consume('KEYWORD')
        self.consume('LPAREN')
        val = self.expression()
        self.consume('RPAREN')
        return ('PRINT', val)

    def block(self):
        stmts = []
        while self.current() and self.current()[0] != 'DEDENT':
            if self.current()[0] == 'NEWLINE':
                self.pos += 1
                continue
            stmts.append(self.statement())
        return stmts

    def assignment(self):
        name = self.consume('ID')
        self.consume('EQUALS')
        value = self.expression()
        return ('ASSIGN', name, value)

    def expression(self):
        lhs = self.term()
        
        # Handle Math or Comparisons
        while self.current() and (self.current()[0] == 'OP' or self.current()[0] == 'CMP_OP'):
            op = self.consume(self.current()[0])
            rhs = self.term()
            lhs = ('BINOP', op, lhs, rhs)
        return lhs

    def term(self):
        token = self.current()
        if token[0] == 'NUMBER':
            return ('NUM', float(self.consume('NUMBER')))
        elif token[0] == 'STRING':
            # Remove quotes
            s = self.consume('STRING')[1:-1] 
            return ('STR', s)
        elif token[0] == 'KEYWORD':
            if token[1] == 'true': 
                self.consume('KEYWORD')
                return ('BOOL', True)
            if token[1] == 'false': 
                self.consume('KEYWORD')
                return ('BOOL', False)
        elif token[0] == 'ID':
            # Check for Function Call: name(arg)
            if self.pos + 1 < len(self.tokens) and self.tokens[self.pos+1][0] == 'LPAREN':
                name = self.consume('ID')
                self.consume('LPAREN')
                arg = self.expression()
                self.consume('RPAREN')
                return ('CALL', name, arg)
            return ('VAR', self.consume('ID'))
        
        raise SyntaxError(f"Unexpected token in expression: {token}")