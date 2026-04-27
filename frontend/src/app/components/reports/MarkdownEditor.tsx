import { Eye, Edit3, SplitSquareHorizontal, Save } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";

type EditorMode = "edit" | "preview" | "split";

interface MarkdownEditorProps {
  initialValue: string;
  loading?: boolean;
  onSave: (payload: {
    title: string;
    weekLabel: string;
    content: string;
    highlights: string[];
    blockers: string[];
    file: File | null;
  }) => Promise<void>;
}

export function MarkdownEditor({ initialValue, loading = false, onSave }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [mode, setMode] = useState<EditorMode>("split");
  const [title, setTitle] = useState("Weekly Internship Report");
  const [weekLabel, setWeekLabel] = useState("Week 1");
  const [highlights, setHighlights] = useState("API integration, dashboard updates");
  const [blockers, setBlockers] = useState("None");
  const [file, setFile] = useState<File | null>(null);

  async function handleSave() {
    await onSave({
      title,
      weekLabel,
      content,
      highlights: highlights.split(",").map((item) => item.trim()).filter(Boolean),
      blockers: blockers.split(",").map((item) => item.trim()).filter(Boolean),
      file,
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Weekly Markdown Report</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={mode === "edit" ? "default" : "outline"} size="sm" onClick={() => setMode("edit")}>
            <Edit3 size={14} />
            Edit
          </Button>
          <Button variant={mode === "preview" ? "default" : "outline"} size="sm" onClick={() => setMode("preview")}>
            <Eye size={14} />
            Preview
          </Button>
          <Button variant={mode === "split" ? "default" : "outline"} size="sm" onClick={() => setMode("split")}>
            <SplitSquareHorizontal size={14} />
            Split
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save size={14} />
            {loading ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Report title" />
          <Input value={weekLabel} onChange={(event) => setWeekLabel(event.target.value)} placeholder="Week label" />
          <Input value={highlights} onChange={(event) => setHighlights(event.target.value)} placeholder="Highlights (comma separated)" />
          <Input value={blockers} onChange={(event) => setBlockers(event.target.value)} placeholder="Blockers (comma separated)" />
        </div>
        <input
          type="file"
          className="mb-4 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <div className={`grid gap-4 ${mode === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {(mode === "edit" || mode === "split") && (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[450px] w-full rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:ring-blue-900"
            />
          )}
          {(mode === "preview" || mode === "split") && (
            <article className="prose prose-sm max-w-none rounded-xl border border-gray-200 bg-gray-50 p-4 dark:prose-invert dark:border-gray-700 dark:bg-gray-950">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
