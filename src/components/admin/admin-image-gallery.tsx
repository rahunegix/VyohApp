"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Link2, Plus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPhotoCropModal } from "@/components/admin/admin-photo-crop-modal";

async function uploadAdminImage(blob: Blob, folder: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "image.jpg");
  form.append("folder", folder);
  const res = await fetch("/api/admin/media", { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Upload failed");
  return json.data.url as string;
}

export interface AdminImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
  label?: string;
  description?: string;
  aspect?: number;
  cropTitle?: string;
  /** First image is treated as primary cover when true */
  primaryFirst?: boolean;
}

export function AdminImageGallery({
  images,
  onChange,
  maxImages = 8,
  folder = "success-stories",
  label = "Images",
  description = "Upload and crop images. First image is used as the cover.",
  aspect = 16 / 11,
  cropTitle = "Crop image",
  primaryFirst = true,
}: AdminImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const onFileSelected = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropConfirm = async (blob: Blob) => {
    setUploading(true);
    setError("");
    try {
      const url = await uploadAdminImage(blob, folder);
      onChange([...images, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    if (!primaryFirst || index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    onChange([selected, ...next]);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || images.length >= maxImages) return;
    onChange([...images, url]);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowUrlInput((v) => !v)}>
            <Link2 className="h-4 w-4" />
            URL
          </Button>
          <Button
            type="button"
            size="sm"
            loading={uploading}
            disabled={images.length >= maxImages}
            onClick={pickFile}
          >
            <Upload className="h-4 w-4" />
            Upload & crop
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addUrl} disabled={!urlInput.trim()}>
            Add URL
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-[16/11] overflow-hidden rounded-xl border border-border bg-muted"
          >
            <Image src={url} alt="" fill className="object-cover" sizes="200px" unoptimized />

            {primaryFirst && index === 0 && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                <Star className="h-3 w-3" />
                Cover
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {primaryFirst && index !== 0 && (
                <button
                  type="button"
                  title="Set as cover"
                  onClick={() => setPrimary(index)}
                  className="rounded-md bg-white/90 p-1.5 text-foreground hover:bg-white"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                title="Remove"
                onClick={() => removeImage(index)}
                className="rounded-md bg-white/90 p-1.5 text-destructive hover:bg-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="flex aspect-[16/11] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-semibold">Add image</span>
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AdminPhotoCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        onClose={() => setCropSrc(null)}
        onConfirm={onCropConfirm}
        aspect={aspect}
        title={cropTitle}
      />
    </div>
  );
}

/** Single cover image with crop + URL fallback */
export function AdminCoverImageField({
  value,
  onChange,
  folder = "success-stories",
  label = "Cover image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  return (
    <AdminImageGallery
      images={value ? [value] : []}
      onChange={(imgs) => onChange(imgs[0] ?? "")}
      maxImages={1}
      folder={folder}
      label={label}
      description="Upload and crop the main cover image (16:11)."
      aspect={16 / 11}
      cropTitle="Crop cover image"
      primaryFirst={false}
    />
  );
}
