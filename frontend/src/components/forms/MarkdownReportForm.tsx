import { ChangeEvent, FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../api/client";

const initialState = {
  title: "",
  week_label: "",
  content: "## Wins\n\n- \n\n## Blockers\n\n- ",
  highlights: "",
  blockers: "",
};

export function MarkdownReportForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(initialState);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const response = await api.post("/reports/", {
      ...form,
      highlights: form.highlights.split(",").map((item) => item.trim()).filter(Boolean),
      blockers: form.blockers.split(",").map((item) => item.trim()).filter(Boolean),
    });

    if (uploadFile) {
      const data = new FormData();
      data.append("file", uploadFile);
      await api.post(`/reports/${response.data.id}/upload`, data);
    }

    setForm(initialState);
    setUploadFile(null);
    setSaving(false);
    onCreated();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="panel space-y-4 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Report title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <input className="input" placeholder="Week 6 · Mar 25 - Mar 31" value={form.week_label} onChange={(e) => setForm((c) => ({ ...c, week_label: e.target.value }))} />
        </div>
        <textarea className="input min-h-[280px]" value={form.content} onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))} />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Highlights, comma separated" value={form.highlights} onChange={(e) => setForm((c) => ({ ...c, highlights: e.target.value }))} />
          <input className="input" placeholder="Blockers, comma separated" value={form.blockers} onChange={(e) => setForm((c) => ({ ...c, blockers: e.target.value }))} />
        </div>
        <input type="file" accept=".pdf,image/*" className="input" onChange={(e: ChangeEvent<HTMLInputElement>) => setUploadFile(e.target.files?.[0] ?? null)} />
        <button className="button-primary" disabled={saving}>{saving ? "Submitting..." : "Submit report"}</button>
      </form>
      <div className="panel p-6">
        <p className="mb-4 text-sm font-semibold text-slate-600">Markdown Preview</p>
        <article className="prose prose-slate max-w-none">
          <ReactMarkdown>{form.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
