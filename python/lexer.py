import re

class Lexer:
    def __init__(self, code):
        self.code = code
        self.tokens = []
        self.current_indent = 0
    
    def tokenize(self):
        token_specs = [
            ('STRING',   r'"[^"]*"'),
            ('NUMBER',   r'\d+(\.\d*)?'),
            # Keywords
            ('KEYWORD',  r'(ifvan|forvan|funcvan|return|print|true|false)\b'),
            # Identifiers/ Variables
            ('ID',       r'[a-zA-Z_]\w*'),
             # Comparison Ops
            ('CMP_OP',   r'(==|>=|<=|>|<)'),
            # Math Ops
            ('OP',       r'[+\-*/]'),
            ('EQUALS',   r'='),
            ('LPAREN',   r'\('),
            ('RPAREN',   r'\)'),
            ('COLON',    r':'),
            ('COMMA',    r','),
            ('NEWLINE',  r'\n'),
            ('SKIP',     r'[ \t]+'),
        ]
        
        lines = self.code.split('\n')
        
        for line in lines:
            stripped = line.strip()
            if not stripped: continue
            
            # Indentation handling
            indent = len(line) - len(line.lstrip())
            if indent > self.current_indent:
                self.tokens.append(('INDENT', indent))
                self.current_indent = indent
            elif indent < self.current_indent:
                while indent < self.current_indent:
                    self.tokens.append(('DEDENT', indent))
                    # Assuming 4 spaces have been indented
                    self.current_indent -= 4
                    if self.current_indent < 0: self.current_indent = 0

            pos = 0
            while pos < len(stripped):
                match = None
                for type_, regex in token_specs:
                    pattern = re.compile(regex)
                    match = pattern.match(stripped, pos)
                    if match:
                        text = match.group(0)
                        if type_ != 'SKIP':
                            self.tokens.append((type_, text))
                        pos = match.end()
                        break
                if not match:
                    raise SyntaxError(f"Illegal character: {stripped[pos]}")
            
            self.tokens.append(('NEWLINE', '\n'))
        
        # Cleanup remaining dedents at end of file
        while self.current_indent > 0:
             self.tokens.append(('DEDENT', 0))
             self.current_indent -= 4

        return self.tokens