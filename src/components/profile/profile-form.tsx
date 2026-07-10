"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updateProfile, type ProfileState } from "@/app/(app)/profile/actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
    </Button>
  );
}

export function ProfileForm({
  fullName,
  email,
  phone,
  contextLabel,
  contextValue,
}: {
  fullName: string;
  email: string;
  phone: string;
  contextLabel: string;
  contextValue: string;
}) {
  const [state, formAction] = useActionState<ProfileState, FormData>(
    updateProfile,
    { error: null, ok: false }
  );

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">
          Full name
        </label>
        <div className="flex h-11 items-center justify-between rounded-sm bg-paper px-3.5 text-[0.95rem] text-muted">
          <span>{fullName}</span>
          <Lock className="size-4" />
        </div>
      </div>

      <Field label="Phone number">
        <Input
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="+234 800 000 0000"
        />
      </Field>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">
          Email address
        </label>
        <div className="flex h-11 items-center justify-between rounded-sm bg-paper px-3.5 text-[0.95rem] text-muted">
          <span>{email}</span>
          <Lock className="size-4" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-soft">
          {contextLabel}
        </label>
        <div className="flex h-11 items-center justify-between rounded-sm bg-paper px-3.5 text-[0.95rem] text-muted">
          <span>{contextValue}</span>
          <Lock className="size-4" />
        </div>
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <SaveButton />
        {state.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
            <Check className="size-4" />
            Saved
          </span>
        ) : null}
        {state.error ? (
          <span className="text-sm text-danger">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
