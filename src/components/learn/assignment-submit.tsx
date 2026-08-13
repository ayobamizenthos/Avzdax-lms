"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { playSuccess } from "@/lib/notification-sound";
import { submitAssignment } from "@/app/(app)/learn/assignments/actions";

export function AssignmentSubmit({ assignmentId }: { assignmentId: string }) {
  const [links, setLinks] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done">(
    "idle"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "done") playSuccess();
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const body = (form.elements.namedItem("body") as HTMLTextAreaElement).value.trim();
    const files = Array.from(fileInputRef.current?.files ?? []);
    const cleanLinks = links.map((link) => link.trim()).filter(Boolean);

    if (!body && files.length === 0 && cleanLinks.length === 0) {
      setError("Add a written response, a file or a link before submitting.");
      return;
    }
    for (const link of cleanLinks) {
      if (!/^https?:\/\//i.test(link)) {
        setError(`"${link}" is not a valid link. Links must start with http.`);
        return;
      }
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Your session expired. Sign in again.");
      return;
    }

    const uploaded: { path: string; name: string }[] = [];
    if (files.length > 0) {
      setStatus("uploading");
      for (const file of files) {
        const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
        const path = `${user.id}/${assignmentId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(path, file, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          });
        if (uploadError) {
          setStatus("idle");
          const reason =
            (uploadError as { message?: string }).message ?? "unknown error";
          const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
          setError(
            `Upload failed for ${file.name} (${sizeMb} MB): ${reason}. Check your connection and try again.`
          );
          return;
        }
        uploaded.push({ path, name: file.name });
      }
    }

    setStatus("saving");
    const payload = new FormData();
    payload.set("assignment_id", assignmentId);
    payload.set("body", body);
    payload.set("files_meta", JSON.stringify(uploaded));
    for (const link of cleanLinks) payload.append("link_url", link);

    const result = await submitAssignment({ error: null, ok: false }, payload);
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("idle");
      setError(result.error ?? "Could not save your submission.");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-sm border border-brand/25 bg-brand-tint px-4 py-3 text-sm text-brand-deep">
        Submitted. Your tutor will review it shortly.
      </p>
    );
  }

  const busy = status === "uploading" || status === "saving";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor={`body-${assignmentId}`}>Written response</Label>
        <Textarea
          id={`body-${assignmentId}`}
          name="body"
          rows={5}
          placeholder="Type your answer here"
        />
      </div>

      <div>
        <Label>Attachments</Label>
        <Input ref={fileInputRef} name="file" type="file" multiple className="pt-2.5" />
        <p className="mt-1.5 text-sm text-muted">Attach one or more files.</p>
      </div>

      <div>
        <Label>Links</Label>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="link_url"
                type="url"
                value={link}
                onChange={(event) =>
                  setLinks((prev) =>
                    prev.map((value, i) =>
                      i === index ? event.target.value : value
                    )
                  )
                }
                placeholder="https://your-project.example.com"
              />
              {links.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setLinks((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-danger-tint hover:text-danger"
                  aria-label="Remove link"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinks((prev) => [...prev, ""])}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <Plus className="size-4" />
          Add another link
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={busy}>
        {busy ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {status === "uploading" ? "Uploading files" : "Submitting"}
          </span>
        ) : (
          "Submit work"
        )}
      </Button>

      <p className="text-xs text-muted">
        Submit any combination of written text, files and links.
      </p>
    </form>
  );
}
