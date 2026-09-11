"use client";

import { useRef, useState } from "react";
import { UploadCloud, AlertCircle, Sparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { validateFiles } from "@/lib/files";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Visual drag & drop zone from the "Documents" Figma screen. This
// component only handles picking files from the user's machine
// (drag-and-drop or the native file browser) and validating them —
// it doesn't own the document list. The parent (DocumentsManager)
// decides what happens to accepted files via onFilesAccepted.
interface DocumentUploadZoneProps {
  onFilesAccepted: (files: File[]) => void;
  preselectedType?: string | null;
  onClearPreselectedType?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export default function DocumentUploadZone({
  onFilesAccepted,
  preselectedType,
  onClearPreselectedType,
  fileInputRef,
}: DocumentUploadZoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [rejections, setRejections] = useState<{ fileName: string; reason: string }[]>([]);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const effectiveInputRef = fileInputRef || internalInputRef;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const { valid, rejected } = validateFiles(files);
    setRejections(rejected);

    if (valid.length > 0) {
      onFilesAccepted(valid);
    }

    // Clear the native input so selecting the same file again re-fires
    // onChange (browsers don't fire it if the file list is unchanged).
    if (effectiveInputRef.current) effectiveInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col h-full">
      {preselectedType && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/90 px-3.5 py-2 text-xs text-brand-blue shadow-2xs animate-in fade-in duration-150">
          <span className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-brand-blue shrink-0" />
            <span>
              Targeting checklist item: <strong className="font-bold text-gray-900">{preselectedType}</strong>
            </span>
          </span>
          {onClearPreselectedType && (
            <button
              type="button"
              onClick={onClearPreselectedType}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2 py-0.5 text-[11px] font-semibold text-brand-blue hover:bg-blue-200 transition-colors"
              title="Clear category targeting"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

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
        className={`flex flex-1 flex-col items-center justify-center rounded-card border-2 border-dashed p-8 md:p-10 text-center transition-colors min-h-[290px] ${
          isDragging ? "border-brand-blue bg-blue-50" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-blue shadow-2xs">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="mt-3 font-bold text-gray-800">
          {preselectedType ? `Upload ${preselectedType}` : t("business.documents.dragDropTitle")}
        </p>
        <p className="mt-1 text-xs text-gray-400 max-w-sm">
          {t("business.documents.supportedFormats")}
        </p>
        <Button className="mt-4 shadow-2xs" onClick={() => effectiveInputRef.current?.click()}>
          {preselectedType ? `Browse ${preselectedType} File` : t("business.documents.dragDropOrBrowse")}
        </Button>
        <input
          ref={effectiveInputRef}
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
