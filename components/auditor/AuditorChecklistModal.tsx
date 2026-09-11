"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  Layers,
  Save,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ChecklistItem, STATUTORY_CIT_CHECKLIST } from "@/components/business/AuditorDocumentChecklist";

export const PRESET_CHECKLISTS: { name: string; description: string; items: ChecklistItem[] }[] = [
  {
    name: "Standard Statutory CIT",
    description: "Standard Sri Lanka Inland Revenue Dept statutory CIT filing pack.",
    items: STATUTORY_CIT_CHECKLIST,
  },
  {
    name: "BOI & Exporter Pack",
    description: "For zero-rated / concessionary export companies and BOI entities.",
    items: [
      ...STATUTORY_CIT_CHECKLIST,
      {
        id: "chk_boi",
        name: "BOI Agreement & Approvals",
        category: "BOI Documents",
        description: "Copy of Section 17 BOI agreement and amendment letters",
        required: true,
        auditorNote: "Verify qualifying concessionary tax rate eligibility",
      },
      {
        id: "chk_export",
        name: "Export Proceeds Realization",
        category: "Export Proof",
        description: "Bank certified inward remittances & realization certificates",
        required: true,
        auditorNote: "Mandatory for 14% / zero-rate export service concession claims",
      },
      {
        id: "chk_customs",
        name: "Customs CUSDEC Schedule",
        category: "Customs Declarations",
        description: "Year-end CUSDEC export clearance documentation schedule",
        required: false,
      },
    ],
  },
  {
    name: "Manufacturing & Trading Pack",
    description: "For goods manufacturers with inventory and customs tariffs.",
    items: [
      ...STATUTORY_CIT_CHECKLIST,
      {
        id: "chk_inventory",
        name: "Physical Stock Count & Valuation",
        category: "Inventory Valuation",
        description: "Year-end physical inventory sheet, costing basis & obsolescence",
        required: true,
        auditorNote: "Reconcile closing stock balance with Cost of Sales in P&L",
      },
      {
        id: "chk_wht",
        name: "WHT & AIT Certificates (Schedule 10)",
        category: "Withholding Tax",
        description: "Withholding tax deduction certificates from clients & banks",
        required: true,
        auditorNote: "Schedule 10 credit validation against RAMIS ledger",
      },
    ],
  },
];

interface AuditorChecklistModalProps {
  companyName: string;
  tin: string;
  assignedAuditorName?: string;
  assignedAuditorFirm?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (items: ChecklistItem[]) => void;
}

export default function AuditorChecklistModal({
  companyName,
  tin,
  assignedAuditorName = "Mr. A. Karunaratne (FCA)",
  assignedAuditorFirm = "Karunaratne & Associates",
  isOpen,
  onClose,
  onSaved,
}: AuditorChecklistModalProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New Item State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Tax Deductions");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [newItemNote, setNewItemNote] = useState("");

  // Load checklist on open
  useEffect(() => {
    if (!isOpen || !companyName) return;

    function loadChecklist() {
      try {
        const saved = localStorage.getItem(`taxease_checklist_${companyName}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            return;
          }
        }
      } catch {
        // Fallback
      }
      // Default to statutory checklist
      setItems(STATUTORY_CIT_CHECKLIST);
    }

    loadChecklist();
  }, [isOpen, companyName]);

  if (!isOpen) return null;

  function handleToggleRequired(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, required: !it.required } : it))
    );
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleLoadPreset(preset: (typeof PRESET_CHECKLISTS)[number]) {
    setItems(preset.items);
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk_custom_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory.trim() || "General",
      description: newItemDescription.trim() || "Auditor requested documentation",
      required: newItemRequired,
      auditorNote: newItemNote.trim() || undefined,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemCategory("Tax Deductions");
    setNewItemDescription("");
    setNewItemNote("");
    setShowAddForm(false);
  }

  async function handleSaveAndPublish() {
    setSaving(true);
    setSuccessMsg("");

    try {
      // 1. Save to localStorage for instant local sync
      localStorage.setItem(`taxease_checklist_${companyName}`, JSON.stringify(items));

      // 2. Dispatch window event for live cross-component sync
      window.dispatchEvent(
        new CustomEvent("taxease_checklist_updated", {
          detail: { companyName, items },
        })
      );

      // 3. Post to backend if online
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${apiUrl}/api/auditor/checklists`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          company_name: companyName,
          items,
          auditor_name: assignedAuditorName,
          auditor_firm: assignedAuditorFirm,
        }),
      }).catch(() => null);

      setSuccessMsg(`Document checklist published to ${companyName} successfully!`);
      if (onSaved) onSaved(items);

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1400);
    } catch {
      setSuccessMsg("Checklist saved locally!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1400);
    } finally {
      setSaving(false);
    }
  }

  const requiredCount = items.filter((i) => i.required).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl overflow-hidden p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue shadow-2xs">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">
                  Audit Document Checklist Manager
                </h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  {companyName}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>TIN: <strong className="text-gray-700 font-mono">{tin}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  {assignedAuditorName} ({assignedAuditorFirm})
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Template Presets Bar */}
        <div className="bg-slate-50/80 border-b border-gray-100 px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-blue shrink-0" />
            <span className="text-xs font-semibold text-gray-700">Apply Pre-configured Audit Pack:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_CHECKLISTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className="text-[11px] font-medium rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 px-2.5 py-1 text-gray-700 hover:text-brand-blue transition-colors shadow-2xs cursor-pointer"
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist Content */}
        <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-3 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1 border-b border-gray-100">
            <span>
              Configured Requirements: <strong className="text-gray-900">{items.length} items</strong> ({requiredCount} Required, {items.length - requiredCount} Optional)
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:text-blue-700 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? "Cancel Add" : "Add Custom Requirement"}</span>
            </button>
          </div>

          {/* Add Custom Requirement Box */}
          {showAddForm && (
            <form
              onSubmit={handleAddItem}
              className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3 animate-in fade-in duration-150 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-blue flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Define New Document Requirement
                </span>
                <span className="text-[11px] text-gray-400">Custom auditor request</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Document Name" required>
                  <Input
                    placeholder="e.g. Export Proceeds Realization Cert"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Category / Schedule">
                  <Input
                    placeholder="e.g. Export Realization, WHT, BOI"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Requirement Description">
                  <Input
                    placeholder="e.g. Bank-certified outward/inward remittance schedule"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                  />
                </Field>
                <Field label="Auditor Special Note / Instruction (Optional)">
                  <Input
                    placeholder="e.g. Must be stamped by authorized bank officer"
                    value={newItemNote}
                    onChange={(e) => setNewItemNote(e.target.value)}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={newItemRequired}
                    onChange={(e) => setNewItemRequired(e.target.checked)}
                    className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                  />
                  <span>Mandatory for statutory CIT submission (Required)</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-brand-blue px-3 py-1.5 text-xs">
                    Add Item
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Items List */}
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="group flex items-start justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5 hover:border-blue-200 hover:shadow-2xs transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleRequired(item.id)}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      item.required
                        ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                    title="Click to toggle Required / Optional"
                  >
                    {item.required ? "Required" : "Optional"}
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-bold text-sm text-gray-900">{item.name}</h5>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-blue">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  {item.auditorNote && (
                    <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-amber-50/80 border border-amber-200/60 px-2 py-1 text-[11px] text-amber-800">
                      <Info className="h-3 w-3 shrink-0 text-amber-600" />
                      <span>Auditor Note: {item.auditorNote}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-status-critical hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove requirement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <ClipboardCheck className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium">Checklist is empty</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Apply one of the pre-configured packs above or add a custom requirement.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-slate-50/90 px-6 py-4">
          <div className="text-xs text-gray-500">
            Publishing updates the client&apos;s checklist in real-time.
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAndPublish}
              disabled={saving}
              className="bg-brand-blue hover:bg-blue-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Publishing..." : "Publish Checklist to Client"}</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
