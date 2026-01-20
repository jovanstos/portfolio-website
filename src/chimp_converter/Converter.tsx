import "../styles/Converter.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertImage } from "../api/converter";
import type { ImageFormat } from "../types/converter";
import ErrorPopup from "../components/ErrorPopup";

function Converter() {
    const [file, setFile] = useState<File | null>(null);
    const [isError, setIsError] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [outputFormat, setOutputFormat] = useState<ImageFormat>("png");

    const convertMutation = useMutation({
        mutationFn: convertImage,
        onSuccess: (blob) => {
            setIsError(false);
            setErrorMessage("");

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `converted.${outputFormat}`;
            link.click();
            URL.revokeObjectURL(url);
        },
        onError: (error: any) => {
            setIsError(true);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        },
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            setIsError(true);
            setErrorMessage("Please select a file to convert.");
            return;
        }

        convertMutation.mutate({
            file,
            outputFormat,
        });
    };

    return (
        <section id="converter">
            <ErrorPopup isError={isError} message={errorMessage} />
            <img src="chimp.gif" width={"100px"} alt="Black and gray chimp running" />
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <select
                    value={outputFormat}
                    onChange={(e) =>
                        setOutputFormat(e.target.value as ImageFormat)
                    }
                >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                    <option value="gif">GIF</option>
                </select>
                <button type="submit" disabled={convertMutation.isPending}>
                    {convertMutation.isPending ? "Converting..." : "Convert"}
                </button>
            </form>
        </section>
    );
}

export default Converter;
