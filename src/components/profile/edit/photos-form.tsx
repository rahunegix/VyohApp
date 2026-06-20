"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, X, Camera } from "lucide-react";
import { getMyProfilePhotos, updateMyProfilePhotos } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { EditSectionShell } from "@/components/profile/edit/shared";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop";

export function EditPhotosForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfilePhotos().then((urls) => {
      setPhotos(urls);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (photos.length >= 6) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 400));
    setPhotos((prev) => [...prev, `${PLACEHOLDER}&t=${Date.now()}`]);
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length < 1) {
      setError(t("photos_min_one"));
      return;
    }
    setSaving(true);
    setError("");
    const result = await updateMyProfilePhotos({ photos });
    setSaving(false);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : t("profile_save_error"));
      return;
    }
    router.push("/profile/edit");
  };

  if (loading) {
    return <p className="px-4 py-12 text-center text-sm text-muted-foreground animate-pulse">{t("loading_profile")}</p>;
  }

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        <p className="text-sm text-muted-foreground">{t("photos_subtitle")}</p>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {t("main")}
                </span>
              )}
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-muted/50"
            >
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("add")}</span>
            </button>
          )}
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
          <Camera className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{t("photos_tip")}</p>
        </div>
      </EditSectionShell>
    </form>
  );
}
