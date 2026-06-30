"use client";

import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PhotoUploadGrid } from "@/components/ui/photo-upload-grid";
import { PhotoSourceSheet } from "@/components/profile/photo-source-sheet";
import { PhotoCameraModal } from "@/components/profile/photo-camera-modal";
import { getCroppedImageBlob } from "@/lib/images/crop-image";
import { compressImageBlob } from "@/lib/images/compress-image";

interface ProfilePhotoCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  aspect?: number;
  title?: string;
}

export function ProfilePhotoCropModal({
  open,
  imageSrc,
  onClose,
  onConfirm,
  aspect = 4 / 5,
  title = "Crop photo",
}: ProfilePhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setApplying(true);
    setError("");
    try {
      const cropped = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const compressed = await compressImageBlob(cropped);
      await onConfirm(compressed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not crop photo");
    } finally {
      setApplying(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="relative h-[min(60vh,420px)] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="space-y-3 px-5 py-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
            aria-label="Zoom"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={handleApply} disabled={applying}>
              {applying ? "Uploading…" : "Save photo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function uploadPhotoBlob(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "photo.jpg");
  const res = await fetch("/api/profiles/photos", {
    method: "POST",
    body: form,
    credentials: "same-origin",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Upload failed");
  return json.data.url as string;
}

export async function uploadPendingPhotoUrls(photos: string[]): Promise<string[]> {
  const uploaded: string[] = [];
  for (const photo of photos) {
    if (photo.startsWith("data:")) {
      const res = await fetch(photo);
      const blob = await res.blob();
      const compressed = await compressImageBlob(blob);
      uploaded.push(await uploadPhotoBlob(compressed));
    } else if (/^https?:\/\//i.test(photo)) {
      uploaded.push(photo);
    }
  }
  return uploaded;
}

interface ProfilePhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  uploadImmediately?: boolean;
  mainLabel?: string;
  addLabel?: string;
}

export function ProfilePhotoUploader({
  photos,
  onChange,
  maxPhotos = 6,
  uploadImmediately = true,
  mainLabel = "Main",
  addLabel = "Add",
}: ProfilePhotoUploaderProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const openSourceSheet = () => {
    if (photos.length >= maxPhotos || uploading) return;
    setSourceSheetOpen(true);
  };

  const onFileSelected = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.readAsDataURL(file);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const onCropConfirm = async (blob: Blob) => {
    setUploading(true);
    setError("");
    try {
      if (uploadImmediately) {
        const url = await uploadPhotoBlob(blob);
        onChange([...photos, url]);
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        onChange([...photos, dataUrl]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (url: string) => {
    if (uploadImmediately && /^https?:\/\//i.test(url)) {
      await fetch(`/api/profiles/photos?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
    }
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <>
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />
      <PhotoUploadGrid
        photos={photos}
        onAdd={openSourceSheet}
        onRemove={removePhoto}
        uploading={uploading}
        mainLabel={mainLabel}
        addLabel={addLabel}
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <PhotoSourceSheet
        open={sourceSheetOpen}
        onOpenChange={setSourceSheetOpen}
        onGallery={() => galleryInputRef.current?.click()}
        onCamera={() => setCameraOpen(true)}
      />
      <PhotoCameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => setCropSrc(dataUrl)}
      />
      <ProfilePhotoCropModal
        open={!!cropSrc}
        imageSrc={cropSrc}
        onClose={() => setCropSrc(null)}
        onConfirm={onCropConfirm}
      />
    </>
  );
}
