import "../styles/JovanLang.css";
import { useMutation } from "@tanstack/react-query";
import { postCodeToCompiler } from "../api/python";

function JovanLang() {

    const compilerMutation = useMutation({
        mutationFn: postCodeToCompiler,
        onSuccess: (blob) => {
            console.log(blob);
        },
        onError: (error: any) => {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unexpected error occurred.");
            }
        },
    });

    function handleSubmit() {
        const testCode = `
        x = 10
        y = 20
        `

        compilerMutation.mutate(testCode);
    };

    return (
        <main id="jovanlang">
            <h1>JovanLang</h1>
            <button onClick={handleSubmit}>Test</button>
        </main>
    );
};

export default JovanLang;
