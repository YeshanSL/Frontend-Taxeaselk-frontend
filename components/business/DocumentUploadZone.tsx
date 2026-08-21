"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import Button from "@/components/ui/Button";

// Visual drag & drop zone from the "Documents" Figma screen. Handles
// drag-over styling and file selection; actual upload wiring (sending
// the file to the FastAPI backend / Supabase storage) is a Week 2 task
// — see the TODO below.
export default function DocumentUploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // TODO (Week 2): upload each file to the backend, e.g.
    // const formData = new FormData(); formData.append("file", files[0]);
    // await fetch(`${API_BASE_URL}/documents/upload`, { method: "POST", body: formData });
    console.log(
      "Selected files (upload not yet wired up):",
      Array.from(files).map((f) => f.name)
    );
  }

  return (
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
        isDragging
          ? "border-brand-blue bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
        <UploadCloud className="h-6 w-6 text-brand-blue" />
      </div>
      <p className="mt-3 font-semibold text-gray-800">
        Upload Financial Documents
      </p>
      <p className="mt-1 text-sm text-gray-400">
        Drag &amp; drop files here · PDF · XLSX · XLS · CSV
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
  );
}
