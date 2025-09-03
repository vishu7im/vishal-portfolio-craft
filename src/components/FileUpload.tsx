
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  label: string;
  isUploading?: boolean;
  maxSize?: number; // in MB
}

export default function FileUpload({
  onUpload,
  accept = "image/*",
  label,
  isUploading = false,
  maxSize = 5, // Default 5MB
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      toast.error("File too large");

      return;
    }

    try {
      await onUpload(file);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      // Clear the input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button
        onClick={handleClick}
        variant="outline"
        className="w-full"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {label}
      </Button>
    </div>
  );
}
