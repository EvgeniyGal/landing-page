"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1a1a1a] p-0 text-white shadow-2xl backdrop:bg-black/70"
      onClose={onCancel}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) {
          onCancel();
        }
      }}
    >
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm leading-6 text-white/60">
            {description}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {pending ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
