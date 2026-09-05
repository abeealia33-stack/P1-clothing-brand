"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/app/admin/categories/actions";

export default function CategoryAddForm() {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    {}
  );

  return (
    <form action={action} className="flex flex-wrap items-start gap-2">
      <div>
        <label htmlFor="category-name" className="sr-only">
          Category name
        </label>
        <input
          id="category-name"
          name="name"
          placeholder="e.g. New in, Sale, Kurtas"
          className="field"
          style={{ width: "16rem" }}
          required
        />
        {state.errors?.name && (
          <p role="alert" className="mt-1.5 text-sm" style={{ color: "#9A4A3C" }}>
            {state.errors.name}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className="btn btn-ink">
        {pending ? "Adding" : "Add category"}
      </button>
    </form>
  );
}
