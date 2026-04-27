import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { internshipService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { Internship } from "../types";

interface InternshipFormState {
  title: string;
  domain: string;
  description: string;
  duration_weeks: string;
  is_active: boolean;
}

const emptyInternshipForm: InternshipFormState = {
  title: "",
  domain: "",
  description: "",
  duration_weeks: "8",
  is_active: true,
};

export function InternshipsPage() {
  const { callApi, loading } = useApi();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InternshipFormState>(emptyInternshipForm);
  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);

  async function loadInternships() {
    await callApi(
      async () => {
        const data = await internshipService.list();
        setInternships(data);
      },
      { errorMessage: "Unable to load internships." }
    );
  }

  useEffect(() => {
    void loadInternships();
  }, []);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyInternshipForm);
  }

  function beginEdit(item: Internship) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      domain: item.domain,
      description: item.description ?? "",
      duration_weeks: String(item.duration_weeks ?? 8),
      is_active: item.is_active,
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const weeks = Number(form.duration_weeks);
    if (!Number.isFinite(weeks) || weeks <= 0) return;

    await callApi(
      async () => {
        const payload = {
          title: form.title.trim(),
          domain: form.domain.trim(),
          description: form.description.trim() || null,
          duration_weeks: weeks,
          is_active: form.is_active,
        };
        if (editingId) {
          await internshipService.update(editingId, payload);
        } else {
          await internshipService.create(payload);
        }
        beginCreate();
        await loadInternships();
      },
      {
        successMessage: editingId ? "Internship updated" : "Internship created",
        errorMessage: editingId ? "Unable to update internship" : "Unable to create internship",
      }
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await callApi(
      async () => {
        await internshipService.remove(deleteTarget.id);
        setDeleteTarget(null);
        if (editingId === deleteTarget.id) beginCreate();
        await loadInternships();
      },
      { successMessage: "Internship deleted", errorMessage: "Unable to delete internship" }
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:translate-y-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{editingId ? "Update Internship" : "Create Internship"}</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create domains like Web Development, Data Science, Design, Marketing.
            </p>
          </div>
          {editingId ? (
            <Button variant="outline" onClick={beginCreate}>
              Create New
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <Input
              placeholder="Internship title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <Input
              placeholder="Domain (e.g., Frontend Development)"
              value={form.domain}
              onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
              required
            />
            <Input
              placeholder="Duration in weeks"
              type="number"
              min={1}
              value={form.duration_weeks}
              onChange={(event) => setForm((prev) => ({ ...prev, duration_weeks: event.target.value }))}
              required
            />
            <label className="flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Active internship
            </label>
            <textarea
              className="min-h-28 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-900 md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading || !form.title.trim() || !form.domain.trim()}>
                <Plus size={16} />
                {loading ? "Saving..." : editingId ? "Update Internship" : "Add Internship"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:translate-y-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Internship Domains</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">{internships.length} total</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {internships.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-blue-700"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{item.domain}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                      item.is_active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="min-h-12 text-xs text-gray-600 dark:text-gray-300">{item.description || "No description added."}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Duration: {item.duration_weeks} weeks</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => beginEdit(item)}>
                    <Pencil size={14} />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(item)}>
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!internships.length ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No internships added yet.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md hover:translate-y-0">
            <CardHeader>
              <CardTitle>Delete Internship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Delete <span className="font-semibold">{deleteTarget.title}</span>? Assigned users will keep account access but
                internship field will be cleared.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  {loading ? "Deleting..." : "Delete"}
                </Button>
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
