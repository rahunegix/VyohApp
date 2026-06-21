"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { getMyProfilePhotos, updateMyProfilePhotos } from "@/services/actions";
import { useTranslation } from "@/hooks/use-translation";
import { PhotoUploadGrid } from "@/components/ui/photo-upload-grid";
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
    return (
      <p className="animate-pulse px-4 py-12 text-center text-sm text-muted-foreground">
        {t("loading_profile")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <EditSectionShell error={error} saving={saving} saveLabel={t("save_changes")}>
        <p className="text-sm text-muted-foreground">{t("photos_subtitle")}</p>
        <PhotoUploadGrid
          photos={photos}
          onAdd={handleAdd}
          onRemove={(url) => setPhotos((prev) => prev.filter((p) => p !== url))}
          uploading={uploading}
          mainLabel={t("main")}
          addLabel={t("add")}
        />
        <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
          <Camera className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">{t("photos_tip")}</p>
        </div>
      </EditSectionShell>
    </form>
  );
}
