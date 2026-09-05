import type { Metadata } from "next";
import CategoryAddForm from "@/components/admin/CategoryAddForm";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import { moveCategoryAction, renameCategoryAction } from "./actions";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireAdmin();

  const { saved, deleted } = await searchParams;
  const categories = await listCategories();

  return (
    <div className="py-8">
      <h1 className="text-4xl">Categories</h1>
      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Your own groupings, separate from the four collections — things like
        “New in” or “Sale”. Tick them on a piece from its edit page. A piece
        can carry more than one.
      </p>

      {(saved || deleted) && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          {saved ? "Saved." : "Deleted. Products keep their other categories."}
        </p>
      )}

      <div className="mt-8 max-w-2xl">
        <CategoryAddForm />
      </div>

      {categories.length === 0 ? (
        <div
          className="mt-10 max-w-2xl border p-8 text-center"
          style={{ borderColor: "var(--color-line)" }}
        >
          <h2 className="text-2xl">No categories yet</h2>
          <p className="measure mx-auto mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Add one above, then tick it on any piece from its edit page.
          </p>
        </div>
      ) : (
        <ul className="mt-8 max-w-2xl divide-y" style={{ borderColor: "var(--color-line)" }}>
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-3 py-3"
              style={{ borderColor: "var(--color-line)" }}
            >
              <form action={renameCategoryAction} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  className="field h-10"
                  aria-label={`Rename ${category.name}`}
                />
                <button type="submit" className="btn btn-quiet h-10 shrink-0">
                  Save
                </button>
              </form>

              <div className="flex shrink-0 items-center gap-1">
                <form action={moveCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="h-8 w-8 text-sm disabled:opacity-30"
                  >
                    ‹
                  </button>
                </form>
                <form action={moveCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === categories.length - 1}
                    aria-label="Move later"
                    className="h-8 w-8 text-sm disabled:opacity-30"
                  >
                    ›
                  </button>
                </form>
                <DeleteCategoryButton id={category.id} name={category.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
