"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/helpers/utils";

interface PhotoUploadGridProps {
  photos: string[];
  maxPhotos?: number;
  onAdd: () => void;
  onRemove: (url: string) => void;
  uploading?: boolean;
  mainLabel?: string;
  addLabel?: string;
  className?: string;
}

/** 2×3 photo grid — reference dating-app upload pattern. */
export function PhotoUploadGrid({
  photos,
  maxPhotos = 6,
  onAdd,
  onRemove,
  uploading = false,
  mainLabel = "Main",
  addLabel = "Add",
  className,
}: PhotoUploadGridProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {photos.map((url, i) => (
        <div
          key={url}
          className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-primary/5 shadow-sm ring-1 ring-border/40"
        >
          <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
          {i === 0 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {mainLabel}
            </span>
          )}
          <button
            type="button"
            onClick={() => onRemove(url)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform active:scale-95"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={onAdd}
          disabled={uploading}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 transition-colors hover:border-primary hover:bg-primary/10 active:scale-[0.98] disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-float)]">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-xs font-semibold text-primary">{addLabel}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
