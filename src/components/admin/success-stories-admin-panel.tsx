"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SuccessStoryRecord } from "@/lib/success-stories/types";

interface StoryForm {
  story_type: "relationship" | "marriage";
  names: string;
  slug: string;
  location: string;
  timeline: string;
  quote: string;
  body: string;
  cover_image_url: string;
  alt_text: string;
  is_featured: boolean;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

const emptyForm: StoryForm = {
  story_type: "relationship",
  names: "",
  slug: "",
  location: "",
  timeline: "",
  quote: "",
  body: "",
  cover_image_url: "",
  alt_text: "",
  is_featured: false,
  status: "draft",
  sort_order: 0,
};

export function SuccessStoriesAdminPanel({ initialStories }: { initialStories: SuccessStoryRecord[] }) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SuccessStoryRecord | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter(
      (s) =>
        s.names.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.story_type.includes(q)
    );
  }, [stories, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (story: SuccessStoryRecord) => {
    setEditing(story);
    setForm({
      story_type: story.story_type,
      names: story.names,
      slug: story.slug,
      location: story.location ?? "",
      timeline: story.timeline ?? "",
      quote: story.quote,
      body: story.body ?? "",
      cover_image_url: story.cover_image_url,
      alt_text: story.alt_text ?? "",
      is_featured: story.is_featured,
      status: story.status,
      sort_order: story.sort_order,
    });
    setError("");
    setModalOpen(true);
  };

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/admin/success-stories/${editing.id}` : "/api/admin/success-stories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Save failed");
        return;
      }
      setModalOpen(false);
      router.refresh();
      const listRes = await fetch("/api/admin/success-stories");
      const listJson = await listRes.json();
      if (listJson.success) setStories(listJson.data);
    } catch {
      setError("Could not save story");
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (story: SuccessStoryRecord) => {
    if (!confirm(`Delete story "${story.names}"?`)) return;
    const res = await fetch(`/api/admin/success-stories/${story.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Delete failed");
      return;
    }
    setStories((prev) => prev.filter((s) => s.id !== story.id));
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="Success stories"
        description="Add and publish stories shown on the website and welcome screens."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, slug, type…"
        onCreate={openCreate}
        createLabel="Add story"
      />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Story</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Featured</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((story) => (
              <tr key={story.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-3">
                  <p className="font-medium">{story.names}</p>
                  <p className="text-xs text-muted-foreground">{story.slug}</p>
                </td>
                <td className="p-3 capitalize">{story.story_type}</td>
                <td className="p-3">
                  <Badge variant={story.status === "published" ? "success" : "secondary"}>
                    {story.status}
                  </Badge>
                </td>
                <td className="p-3">{story.is_featured ? "Yes" : "No"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {story.status === "published" && (
                      <Link href={`/success-stories/${story.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" title="View on site">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(story)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteStory(story)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="p-6 text-sm text-muted-foreground">No stories found.</p>}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit success story" : "Add success story"}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Names">
            <Input value={form.names} onChange={(e) => setForm({ ...form, names: e.target.value })} />
          </Field>
          <Field label="Story type">
            <select
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
              value={form.story_type}
              onChange={(e) =>
                setForm({ ...form, story_type: e.target.value as StoryForm["story_type"] })
              }
            >
              <option value="relationship">Relationship story</option>
              <option value="marriage">Marriage story</option>
            </select>
          </Field>
          <Field label="Slug (optional)">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
          </Field>
          <Field label="Status">
            <select
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as StoryForm["status"] })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Timeline">
            <Input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
          </Field>
          <Field label="Cover image URL">
            <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
          </Field>
          <Field label="Image alt text">
            <Input value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} />
          </Field>
          <Field label="Sort order">
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            Featured on welcome / home sections
          </label>
        </div>
        <Field label="Short quote">
          <Textarea rows={2} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
        </Field>
        <Field label="Full story (detail page)">
          <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={loading} onClick={save}>{editing ? "Save changes" : "Create story"}</Button>
        </div>
      </AdminModal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
