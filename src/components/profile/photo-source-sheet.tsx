"use client";

import { Camera, ImageIcon } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/helpers/utils";

interface PhotoSourceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGallery: () => void;
  onCamera: () => void;
}

export function PhotoSourceSheet({
  open,
  onOpenChange,
  onGallery,
  onCamera,
}: PhotoSourceSheetProps) {
  const { t } = useTranslation();

  const options = [
    {
      id: "gallery",
      label: t("photo_from_gallery"),
      description: t("photo_from_gallery_desc"),
      icon: ImageIcon,
      onClick: () => {
        onOpenChange(false);
        onGallery();
      },
    },
    {
      id: "camera",
      label: t("photo_use_camera"),
      description: t("photo_use_camera_desc"),
      icon: Camera,
      onClick: () => {
        onOpenChange(false);
        onCamera();
      },
    },
  ] as const;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("photo_add_title")}
      description={t("photo_add_subtitle")}
      centeredTitle
      showClose={false}
      size="default"
    >
      <div className="space-y-2.5 pb-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={option.onClick}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-white p-4 text-left",
                "transition-colors hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]"
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-foreground">{option.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
