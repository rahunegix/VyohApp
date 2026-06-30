"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

interface PhotoCameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export function PhotoCameraModal({ open, onClose, onCapture }: PhotoCameraModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setError("");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError(t("face_camera_denied"));
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera, t]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]">
        <div className="border-b border-border/50 px-5 py-4">
          <h2 className="text-lg font-bold">{t("photo_use_camera")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("photo_camera_hint")}</p>
        </div>

        <div className="relative aspect-[3/4] bg-black">
          {error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/90">
              {error}
            </div>
          ) : (
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          )}
        </div>

        <div className="flex gap-3 px-5 py-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleCapture}
            disabled={!ready || !!error}
          >
            <Camera className="mr-2 h-4 w-4" />
            {t("photo_capture")}
          </Button>
        </div>
      </div>
    </div>
  );
}
