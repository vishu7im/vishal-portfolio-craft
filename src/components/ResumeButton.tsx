
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface ResumeButtonProps {
  resumeUrl?: string;
  resumeName?: string;
  className?: string;
}

const ResumeButton: React.FC<ResumeButtonProps> = ({
  resumeUrl,
  resumeName = "Resume.pdf",
  className
}) => {
  if (!resumeUrl) return null;

  // Convert Google Drive view URL to direct download URL if needed
  const getDownloadUrl = () => {
    if (resumeUrl.includes('drive.google.com/file/d')) {
      // Extract the file ID from the Google Drive URL
      const fileId = resumeUrl.match(/\/d\/(.+?)\/view/)?.[1];
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    return resumeUrl;
  };

  // Get the preview URL (same as the original URL for Google Drive)
  const getPreviewUrl = () => {
    return resumeUrl;
  };

  const handlePreview = () => {
    window.open(getPreviewUrl(), '_blank');
    toast.success("Opening Resume Opening resume in a new tab for preview");

  };

  const handleDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = getDownloadUrl();
    downloadLink.download = resumeName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success(`Downloading ${resumeName}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`btn-primary group overflow-hidden relative ${className}`}
        >
          <span className="flex items-center px-8 sm:px-6 gap-2 sm:gap-2 relative z-10">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Resume</span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
          </span>
          <div className="absolute inset-0 bg-primary transform translate-y-0 transition-transform duration-300"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePreview} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>Preview</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ResumeButton;
