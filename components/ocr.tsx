"use client";

declare global {
  interface Window {
    cv: any;
  }
}

import { useMail } from "./context";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";

export default function ProcessStep() {
const router = useRouter();
const { uploadedImages, setUploadedImages } = useMail();
const [cvReady, setCvReady] = useState(false);
const [processedCount, setProcessedCount] = useState(0);

    // Load OpenCV
    useEffect(() => {
        if (
        typeof window !== "undefined" &&
        !window.cv &&
        !document.getElementById("opencv-script")
        ) {
        const script = document.createElement("script");
        script.id = "opencv-script";
        script.src = "/opencv/opencv.js";
        script.async = true;
        script.onload = () => {
            window.cv.onRuntimeInitialized = () => {
            setCvReady(true);
            };
        };
        document.body.appendChild(script);
        } else if (window.cv && window.cv.Mat) {
        setCvReady(true);
        }
    }, []);

    // Process images when OpenCV is ready
    useEffect(() => {
        if (!cvReady || uploadedImages.length === 0) return;

        uploadedImages.forEach((img, idx) => {
        if (img.processed?.ocrText) return;

        const processImage = async () => {
            const image = new Image();
            image.src = img.original.preview;

            try {
            await image.decode();

            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(image, 0, 0);

            const cv = window.cv;
            const src = cv.imread(canvas);
            const dst = new cv.Mat();

            // Processing - grayscale, denoising, thresholding, resizing
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 0);
            cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
            cv.resize(dst, dst, new cv.Size(0, 0), 2, 2, cv.INTER_LINEAR);
            cv.imshow(canvas, dst);

            const processedPreview = canvas.toDataURL("image/png");

            src.delete();
            dst.delete();

            // Perform OCR
            const result = await Tesseract.recognize(processedPreview, "eng+jpn", {
                //tessedit_pageseg_mode: "5"
                //tessedit_ocr_engine_mode: "1"
                logger: (m) => console.log(m),
            });

            setUploadedImages((prev) => {
                const updated = [...prev];
                updated[idx].processed = {
                preview: processedPreview,
                ocrText: result.data.text,
                };
                return updated;
            });

            setProcessedCount((prev) => prev + 1);
            } catch (err) {
            console.error("Failed to process image", err);
            }
        };

        processImage();
        });
    }, [cvReady, uploadedImages, setUploadedImages]);

    // Navigate to review page when done
    useEffect(() => {
    const done = uploadedImages.length > 0 &&
                uploadedImages.every(img => img.processed?.ocrText);

    if (done) {
        router.push("/review");
    }
    }, [uploadedImages, router]);

    // Progress Bar

    const totalImages = uploadedImages.length;
    const completed = uploadedImages.filter((img) => img.processed?.ocrText).length;

    const uploadProgress = totalImages
    ? Math.round((completed / totalImages) * 100)
    : 0;

    return (
        <div className="p-8">
        <h1 className="text-xl font-semibold mb-4">Processing...</h1>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
            ></div>
        </div>

        <ul className="space-y-4">
            {uploadedImages.map((img, i) => (
            <li key={img.id} className="bg-white shadow p-4 rounded">
                <p className="font-bold mb-2">Image {i + 1}</p>
                <img
                src={img.processed?.preview || img.original.preview}
                className="mb-2 max-w-xs rounded"
                alt={`Processed ${i}`}
                />
                <p className="text-gray-700 whitespace-pre-wrap">
                {img.processed?.ocrText || "Processing..."}
                </p>
            </li>
            ))}
        </ul>
        </div>
    );
}