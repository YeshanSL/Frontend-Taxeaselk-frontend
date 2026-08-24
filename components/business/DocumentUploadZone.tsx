"use client";

import { useRef, useState } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { validateFiles } from "@/lib/files";

// Visual drag & drop zone from the "Documents" Figma screen. This
// component only handles picking files from the user's machine
// (drag-and-drop or the native file browser) and validating them —
// it doesn't own the document list. The parent (DocumentsManager)
// decides what happens to accepted files via onFilesAccepted.
export default function DocumentUploadZone({
  onFilesAccepted,
}: {
  onFilesAccepted: (files: File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [rejections, setRejections] = useState<{ fileName: string; reason: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const { valid, rejected } = validateFiles(files);
    setRejections(rejected);

    if (valid.length > 0) {
      onFilesAccepted(valid);
    }

    // Clear the native input so selecting the same file again re-fires
    // onChange (browsers don't fire it if the file list is unchanged).
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-card border-2 border-dashed p-12 text-center transition-colors ${
          isDragging ? "border-brand-blue bg-blue-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
          <UploadCloud className="h-6 w-6 text-brand-blue" />
        </div>
        <p className="mt-3 font-semibold text-gray-800">
          Upload Financial Documents
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Drag &amp; drop files here · PDF · XLSX · XLS · CSV · max 10MB
        </p>
        <Button className="mt-4" onClick={() => inputRef.current?.click()}>
          Browse
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {rejections.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-lg border border-red-100 bg-red-50 p-3">
          {rejections.map((r) => (
            <p key={r.fileName} className="flex items-start gap-2 text-xs text-status-critical">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-medium">{r.fileName}</span> — {r.reason}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
