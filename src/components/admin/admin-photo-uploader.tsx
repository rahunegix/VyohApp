"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, GripVertical, Link2, Plus, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPhotoCropModal } from "@/components/admin/admin-photo-crop-modal";
import { blobToDataUrl, dataUrlToBlob } from "@/lib/images/crop-image";

const MAX_PHOTOS = 6;

async function uploadPhotoBlob(userId: string, blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "photo.jpg");
  const res = await fetch(`/api/admin/users/${userId}/photos`, { method: "POST", body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Upload failed");
  return json.data.url as string;
}

export async function uploadPendingPhotoUrls(userId: string, photos: string[]): Promise<string[]> {
  const uploaded: string[] = [];
  for (const photo of photos) {
    if (photo.startsWith("data:")) {
      const blob = await dataUrlToBlob(photo);
      uploaded.push(await uploadPhotoBlob(userId, blob));
    } else {
      uploaded.push(photo);
    }
  }
  return uploaded;
}

interface AdminPhotoUploaderProps {
  userId?: string;
  photos: string[];
  onChange: (photos: string[]) => void;
}

export function AdminPhotoUploader({ userId, photos, onChange }: AdminPhotoUploaderProps) {
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
      if (userId) {
        const url = await uploadPhotoBlob(userId, blob);
        onChange([...photos, url]);
      } else {
        const dataUrl = await blobToDataUrl(blob);
        onChange([...photos, dataUrl]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...photos];
    const [selected] = next.splice(index, 1);
    onChange([selected, ...next]);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || photos.length >= MAX_PHOTOS) return;
    onChange([...photos, url]);
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Profile photos</p>
          <p className="text-xs text-muted-foreground">
            Upload up to {MAX_PHOTOS} photos. First photo is the main profile picture.
            {!userId && " Photos upload to storage when you save the new user."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput((v) => !v)}
          >
            <Link2 className="h-4 w-4" />
            URL
          </Button>
          <Button
            type="button"
            size="sm"
            loading={uploading}
            disabled={photos.length >= MAX_PHOTOS}
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
        {photos.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted"
          >
            {url.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src={url} alt="" fill className="object-cover" sizes="160px" unoptimized />
            )}

            {index === 0 && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                <Star className="h-3 w-3" />
                Main
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {index !== 0 && (
                <button
                  type="button"
                  title="Set as main"
                  onClick={() => setPrimary(index)}
                  className="rounded-md bg-white/90 p-1.5 text-foreground hover:bg-white"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                title="Remove"
                onClick={() => removePhoto(index)}
                className="rounded-md bg-white/90 p-1.5 text-destructive hover:bg-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {uploading ? (
              <Camera className="h-6 w-6 animate-pulse" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
            <span className="text-xs font-semibold">Add photo</span>
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
          Use the star button to set the main photo.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AdminPhotoCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        onClose={() => setCropSrc(null)}
        onConfirm={onCropConfirm}
      />
    </div>
  );
}
