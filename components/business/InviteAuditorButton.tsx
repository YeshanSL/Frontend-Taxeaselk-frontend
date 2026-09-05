"use client";

import { useState } from "react";
import { UserPlus, X, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

export default function InviteAuditorButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/api/auditor-review/invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, firmName }),
      });
      if (res.ok) {
        setInvited(true);
        setTimeout(() => {
          setOpen(false);
          setInvited(false);
          setEmail("");
          setFirmName("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to invite auditor:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="primary"
        icon={<UserPlus className="h-4 w-4" />}
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        Invite Auditor
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="font-semibold text-gray-900">Invite Auditor</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {invited ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-status-success">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-3 font-semibold text-gray-900">Invitation Sent!</p>
                <p className="mt-1 text-sm text-gray-500">The auditor has been invited to review your filing.</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-4">
                <Field label="Auditor Email">
                  <Input
                    type="email"
                    placeholder="auditor@firm.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Audit Firm Name">
                  <Input
                    type="text"
                    placeholder="e.g. Mr. Karunaratne & Associates"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    required
                  />
                </Field>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
