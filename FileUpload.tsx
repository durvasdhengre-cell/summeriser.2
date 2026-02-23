import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  isProcessing: boolean;
}

const FileUpload = ({ onFileContent, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          onFileContent(reader.result as string, file.name);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        onFileContent(text, file.name);
      }
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 rounded-lg border border-primary/20 bg-accent p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!isProcessing && (
              <button
                onClick={clearFile}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all duration-300",
              dragActive
                ? "border-primary bg-accent/60 scale-[1.01]"
                : "border-border hover:border-primary/40 hover:bg-accent/30"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
              dragActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop your medical document or image here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports images (JPG, PNG), TXT, CSV, and other text files
              </p>
            </div>
            <input
              type="file"
              onChange={handleChange}
              accept=".txt,.csv,.md,.json,.xml,.html,.jpg,.jpeg,.png,.webp,.bmp,.gif"
              className="hidden"
            />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
