import { execSync } from 'child_process';
import * as fs from 'fs';

// Terrible half vibe coded prototype but it worked! This is a good test.

function parseAddLang(code: string): number[] {
    return code.split('+').map(num => parseInt(num.trim(), 10));
}

export class MyLanguageCompiler {
    compile(numbers: number[]): string {
        const irLines: string[] = [
            'target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-n32:64-S128"',
            'target triple = "wasm32-unknown-unknown"',
            '',
            'define i32 @main() {',
            'entry:'
        ];

        let lastVar = '0';
        numbers.forEach((val, i) => {
            const currentVar = `%v${i}`;
            irLines.push(`  ${currentVar} = add i32 ${lastVar}, ${val}`);
            lastVar = currentVar;
        });

        irLines.push(`  ret i32 ${lastVar}`);
        irLines.push('}');
        return irLines.join('\n');
    }
}

export async function buildLanguage(inputCode: string) {
    const numbers = parseAddLang(inputCode);
    const compiler = new MyLanguageCompiler();
    const ir = compiler.compile(numbers);

    const irFile = 'output.ll';
    const wasmFile = 'program.wasm';

    fs.writeFileSync(irFile, ir);
    console.log("Step 1: AddLang parsed and LLVM IR generated.");

    try {
        // This runs CLANG inside your Docker container
        execSync(`clang --target=wasm32 -nostdlib -Wl,--no-entry -Wl,--export-all -o ${wasmFile} ${irFile}`);
        console.log(`Step 2: Compiled to Universal WASM: ${wasmFile}`);

        // Provide instructions for the user
        console.log("\nTo run this code on ANY machine, host the .wasm file and use:");
        console.log("WebAssembly.instantiateStreaming(fetch('program.wasm'))");
    } catch (error) {
        console.error("Compilation failed. Check your Docker toolchain.", error);
    }
}
