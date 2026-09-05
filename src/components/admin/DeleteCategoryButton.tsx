"use client";

import { deleteCategoryAction } from "@/app/admin/categories/actions";

/** A plain confirm() is enough here — nothing downstream needs undoing besides
    this one row, unlike deleting a piece with photos, sizes and order history. */
export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCategoryAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? Products keep their other categories.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="h-8 px-2 text-xs underline underline-offset-2"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Delete
      </button>
    </form>
  );
}
