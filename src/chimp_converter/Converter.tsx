import "../styles/Converter.css";
import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertImage } from "../api/converter";
import type { ImageFormat } from "../types/converter";
import ErrorPopup from "../components/ErrorPopup";

function Converter() {
    const [file, setFile] = useState<File | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [outputFormat, setOutputFormat] = useState<ImageFormat>("png");
    const [isDragging, setIsDragging] = useState(false);

    const convertMutation = useMutation({
        mutationFn: convertImage,
        onSuccess: (blob) => {
            setIsError(false);
            setErrorMessage("");

            const originalName = file?.name.split(".")[0]

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${originalName}.${outputFormat}`;
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

    const handleFile = (newFile: File) => {
        setFile(newFile);
        setIsError(false);
        setErrorMessage("");
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <section id="converter">
            <ErrorPopup isError={isError} message={errorMessage} />
            <div id="img-holder">
                <img src="/chimp.gif" width={"100px"} alt="One black and gray chimpanze running" />
            </div>
            <form onSubmit={handleSubmit}>
                <div
                    className={`file-dropzone ${isDragging ? "dragging" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById("fileInput")?.click()}
                >
                    {file ? file.name : "Click or drag a file here"}
                </div>
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                />
                <div id="converter-options">
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
                </div>
            </form>
        </section>
    );
}

export default Converter;
