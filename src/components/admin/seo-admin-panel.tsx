"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { AdminCoverImageField } from "@/components/admin/admin-image-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SeoFaqItem, SeoPageRecord, SeoRelatedLink, SeoSection } from "@/lib/seo/types";

interface SeoForm {
  route_path: string;
  page_kind: "static" | "programmatic";
  slug: string;
  title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  canonical_path: string;
  robots_index: boolean;
  robots_follow: boolean;
  h1: string;
  hero_subtitle: string;
  intro_html: string;
  sections_json: string;
  faq_json: string;
  focus_keywords: string;
  related_links_json: string;
  is_published: boolean;
  sort_order: number;
}

const emptyForm: SeoForm = {
  route_path: "/matrimony/",
  page_kind: "programmatic",
  slug: "",
  title: "",
  meta_description: "",
  meta_keywords: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  canonical_path: "",
  robots_index: true,
  robots_follow: true,
  h1: "",
  hero_subtitle: "",
  intro_html: "",
  sections_json: "[]",
  faq_json: "[]",
  focus_keywords: "",
  related_links_json: "[]",
  is_published: true,
  sort_order: 0,
};

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function SeoAdminPanel({ initialPages }: { initialPages: SeoPageRecord[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeoPageRecord | null>(null);
  const [form, setForm] = useState<SeoForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.route_path.toLowerCase().includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q)
    );
  }, [pages, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (page: SeoPageRecord) => {
    setEditing(page);
    setForm({
      route_path: page.route_path,
      page_kind: page.page_kind,
      slug: page.slug ?? "",
      title: page.title,
      meta_description: page.meta_description,
      meta_keywords: page.meta_keywords ?? "",
      og_title: page.og_title ?? "",
      og_description: page.og_description ?? "",
      og_image_url: page.og_image_url ?? "",
      canonical_path: page.canonical_path ?? "",
      robots_index: page.robots_index,
      robots_follow: page.robots_follow,
      h1: page.h1 ?? "",
      hero_subtitle: page.hero_subtitle ?? "",
      intro_html: page.intro_html ?? "",
      sections_json: JSON.stringify(page.sections ?? [], null, 2),
      faq_json: JSON.stringify(page.faq ?? [], null, 2),
      focus_keywords: (page.focus_keywords ?? []).join(", "),
      related_links_json: JSON.stringify(page.related_links ?? [], null, 2),
      is_published: page.is_published,
      sort_order: page.sort_order,
    });
    setError("");
    setModalOpen(true);
  };

  const buildPayload = () => ({
    route_path: form.route_path,
    page_kind: form.page_kind,
    slug: form.slug || undefined,
    title: form.title,
    meta_description: form.meta_description,
    meta_keywords: form.meta_keywords || null,
    og_title: form.og_title || null,
    og_description: form.og_description || null,
    og_image_url: form.og_image_url || null,
    canonical_path: form.canonical_path || null,
    robots_index: form.robots_index,
    robots_follow: form.robots_follow,
    h1: form.h1 || null,
    hero_subtitle: form.hero_subtitle || null,
    intro_html: form.intro_html || null,
    sections: parseJsonField<SeoSection[]>(form.sections_json, []),
    faq: parseJsonField<SeoFaqItem[]>(form.faq_json, []),
    focus_keywords: form.focus_keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    related_links: parseJsonField<SeoRelatedLink[]>(form.related_links_json, []),
    is_published: form.is_published,
    sort_order: form.sort_order,
  });

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      const url = editing ? `/api/admin/seo-pages/${editing.id}` : "/api/admin/seo-pages";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Save failed");
        return;
      }
      setModalOpen(false);
      router.refresh();
      const listRes = await fetch("/api/admin/seo-pages");
      const listJson = await listRes.json();
      if (listJson.success) setPages(listJson.data);
    } catch {
      setError("Could not save SEO page");
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (page: SeoPageRecord) => {
    if (!confirm(`Delete SEO page "${page.title}"?`)) return;
    const res = await fetch(`/api/admin/seo-pages/${page.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Delete failed");
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== page.id));
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        title="SEO Management"
        description="Edit titles, meta descriptions, FAQ, and programmatic landing pages — like Reddit post SEO fields."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search route, title, slug…"
        onCreate={openCreate}
        createLabel="Add SEO page"
      />

      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Page</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Meta</th>
              <th className="text-left p-3">Index</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((page) => (
              <tr key={page.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-3">
                  <p className="font-medium">{page.title}</p>
                  <p className="text-xs text-muted-foreground">{page.route_path}</p>
                </td>
                <td className="p-3">
                  <Badge variant={page.page_kind === "programmatic" ? "default" : "secondary"}>
                    {page.page_kind}
                  </Badge>
                </td>
                <td className="p-3 max-w-xs">
                  <p className="line-clamp-2 text-xs text-muted-foreground">{page.meta_description}</p>
                </td>
                <td className="p-3">
                  <Badge variant={page.is_published && page.robots_index ? "success" : "secondary"}>
                    {page.is_published ? (page.robots_index ? "Indexed" : "Noindex") : "Draft"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {page.is_published && (
                      <Link href={page.route_path} target="_blank">
                        <Button variant="ghost" size="sm" title="Preview">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(page)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deletePage(page)}
                      disabled={page.route_path === "/"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="p-6 text-sm text-muted-foreground">No SEO pages found.</p>}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit SEO page" : "Add SEO page"}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Page type">
            <select
              className="h-10 w-full rounded-xl border border-border px-3 text-sm"
              value={form.page_kind}
              onChange={(e) =>
                setForm({
                  ...form,
                  page_kind: e.target.value as SeoForm["page_kind"],
                  route_path:
                    e.target.value === "programmatic" ? "/matrimony/" : form.route_path,
                })
              }
            >
              <option value="static">Static route (/, /welcome)</option>
              <option value="programmatic">Programmatic (/matrimony/slug)</option>
            </select>
          </Field>
          <Field label="Sort order">
            <Input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </Field>
          {form.page_kind === "static" ? (
            <Field label="Route path" className="sm:col-span-2">
              <Input
                value={form.route_path}
                onChange={(e) => setForm({ ...form, route_path: e.target.value })}
                placeholder="/ or /welcome"
              />
            </Field>
          ) : (
            <Field label="Slug" className="sm:col-span-2">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="alternative-maangal-com"
              />
              <p className="mt-1 text-xs text-muted-foreground">Live URL: /matrimony/{form.slug || "your-slug"}</p>
            </Field>
          )}
          <Field label="SEO title" className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Meta description" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            />
          </Field>
          <Field label="Meta keywords (comma separated)" className="sm:col-span-2">
            <Input
              value={form.meta_keywords}
              onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
            />
          </Field>
          <Field label="H1 heading">
            <Input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} />
          </Field>
          <Field label="Hero subtitle">
            <Input
              value={form.hero_subtitle}
              onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
            />
          </Field>
          <Field label="OG title">
            <Input value={form.og_title} onChange={(e) => setForm({ ...form, og_title: e.target.value })} />
          </Field>
          <Field label="OG image URL" className="sm:col-span-2">
            <AdminCoverImageField
              value={form.og_image_url}
              onChange={(og_image_url) => setForm({ ...form, og_image_url })}
              folder="seo"
              label="OG share image"
            />
          </Field>
          <Field label="OG description" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={form.og_description}
              onChange={(e) => setForm({ ...form, og_description: e.target.value })}
            />
          </Field>
          <Field label="Canonical path">
            <Input
              value={form.canonical_path}
              onChange={(e) => setForm({ ...form, canonical_path: e.target.value })}
              placeholder="Auto from route if empty"
            />
          </Field>
          <Field label="Focus keywords (comma separated)">
            <Input
              value={form.focus_keywords}
              onChange={(e) => setForm({ ...form, focus_keywords: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.robots_index}
              onChange={(e) => setForm({ ...form, robots_index: e.target.checked })}
            />
            Allow search indexing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Published
          </label>
        </div>

        <Field label="Intro content (rich text)">
          <AdminRichTextEditor
            value={form.intro_html}
            onChange={(intro_html) => setForm({ ...form, intro_html })}
            minHeight={140}
            placeholder="Intro paragraph for SEO landing pages…"
          />
        </Field>
        <Field label="Content sections (JSON array)">
          <Textarea
            rows={4}
            value={form.sections_json}
            onChange={(e) => setForm({ ...form, sections_json: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="FAQ (JSON array of question/answer)">
          <Textarea
            rows={4}
            value={form.faq_json}
            onChange={(e) => setForm({ ...form, faq_json: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>
        <Field label="Related links (JSON array)">
          <Textarea
            rows={2}
            value={form.related_links_json}
            onChange={(e) => setForm({ ...form, related_links_json: e.target.value })}
            className="font-mono text-xs"
          />
        </Field>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button loading={loading} onClick={save}>
            {editing ? "Save changes" : "Create page"}
          </Button>
        </div>
      </AdminModal>
    </>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
