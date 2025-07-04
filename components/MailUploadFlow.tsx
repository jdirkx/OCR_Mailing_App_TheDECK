"use client";

import React, { useState } from "react";
import ImageUploadStep from "./ImageUploadStep";      // Step 1: User uploads images
import MailIntakeStep2 from "./MailIntake2";      // Step 2: User selects images and assigns to client

export default function MailUploadWorkflow() {
  // Step state: 1 = upload, 2 = mail intake
  const [step, setStep] = useState(1);
  // Images and previews from step 1
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Step 1: Image upload
  const handleUploadNext = (images: File[], previews: string[]) => {
    setUploadedImages(images);
    setImagePreviews(previews);
    setStep(2);
  };

  // Step 2: On done, reset everything and go back to step 1
  const handleMailIntakeDone = () => {
    setUploadedImages([]);
    setImagePreviews([]);
    setStep(1);
  };

  return (
    <>
      {step === 1 && (
        <ImageUploadStep onNext={handleUploadNext} />
      )}
      {step === 2 && (
        <MailIntakeStep2
          uploadedImages={uploadedImages}
          imagePreviews={imagePreviews}
          onDone={handleMailIntakeDone}
        />
      )}
    </>
  );
}
