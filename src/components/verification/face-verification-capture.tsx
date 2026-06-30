"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanFace, Shield, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitFaceVerificationClient,
  submitFaceReviewClient,
} from "@/lib/verification/client-face";
import { useTranslation } from "@/hooks/use-translation";

const CAPTURE_PROMPTS = ["face_prompt_center", "face_prompt_left", "face_prompt_right"] as const;
const CAPTURE_INTERVAL_MS = 1100;

type Phase = "idle" | "camera" | "scanning" | "done" | "error" | "pending_review";

interface FaceVerificationCaptureProps {
  onVerified?: () => void;
  onPendingReview?: () => void;
  showStartButton?: boolean;
}

export function FaceVerificationCapture({
  onVerified,
  onPendingReview,
  showStartButton = true,
}: FaceVerificationCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [promptIndex, setPromptIndex] = useState(0);
  const [error, setError] = useState("");
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<{ reason?: string; confidence?: number } | null>(
    null
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.88);
  }, []);

  const startCamera = async () => {
    setError("");
    setCanSubmitReview(false);
    setLastAnalysis(null);
    setCapturedFrames([]);
    setPhase("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setTimeout(() => void runScan(), 600);
    } catch {
      setPhase("error");
      setError(t("face_camera_denied"));
    }
  };

  const runScan = async () => {
    setPhase("scanning");
    const frames: string[] = [];

    for (let i = 0; i < CAPTURE_PROMPTS.length; i++) {
      setPromptIndex(i);
      await new Promise((r) => setTimeout(r, CAPTURE_INTERVAL_MS));
      const frame = captureFrame();
      if (frame) frames.push(frame);
    }

    stopCamera();
    setCapturedFrames(frames);

    if (frames.length < 2) {
      setPhase("error");
      setError(t("face_capture_failed"));
      return;
    }

    const result = await submitFaceVerificationClient(frames);
    if (result.success) {
      setPhase("done");
      onVerified?.();
      return;
    }

    setPhase("error");
    setError(typeof result.error === "string" ? result.error : t("face_verify_failed"));
    setLastAnalysis(result.analysis ?? null);

    if (result.code === "FACE_REVIEW_AVAILABLE" || result.code === "FACE_MISMATCH") {
      setCanSubmitReview(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!capturedFrames.length) return;
    setReviewSubmitting(true);
    setError("");

    const result = await submitFaceReviewClient(
      capturedFrames,
      lastAnalysis?.reason ?? error,
      lastAnalysis?.confidence
    );

    setReviewSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPhase("pending_review");
    onPendingReview?.();
  };

  const ringClass =
    phase === "scanning"
      ? "border-primary animate-pulse"
      : phase === "done"
        ? "border-success"
        : phase === "pending_review"
          ? "border-warning"
          : phase === "error"
            ? "border-destructive"
            : "border-border";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-[6px] border-4 sm:h-64 sm:w-64 ${ringClass}`}
      >
        {phase === "camera" || phase === "scanning" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-[92%] w-[92%] rounded-[6px] object-cover"
          />
        ) : (
          <div className="flex h-[92%] w-[92%] items-center justify-center rounded-[6px] bg-muted/80">
            {phase === "done" ? (
              <Shield className="h-16 w-16 text-success" />
            ) : phase === "pending_review" ? (
              <Clock className="h-16 w-16 text-warning" />
            ) : phase === "error" ? (
              <AlertCircle className="h-16 w-16 text-destructive" />
            ) : (
              <ScanFace className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      <p className="mt-5 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
        {phase === "scanning"
          ? t(CAPTURE_PROMPTS[promptIndex])
          : phase === "done"
            ? t("verification_done")
            : phase === "pending_review"
              ? t("face_review_submitted")
              : phase === "error"
                ? error
                : t("verification_position")}
      </p>

      {phase === "idle" && showStartButton && (
        <Button onClick={() => void startCamera()} className="mt-6 w-full" size="lg">
          {t("start_verification")}
        </Button>
      )}

      {phase === "error" && (
        <div className="mt-6 w-full space-y-2.5">
          <Button onClick={() => void startCamera()} className="w-full" variant="outline" size="lg">
            {t("face_try_again")}
          </Button>
          {canSubmitReview && (
            <>
              <p className="text-center text-xs text-muted-foreground">{t("face_review_hint")}</p>
              <Button
                onClick={() => void handleSubmitReview()}
                className="w-full"
                size="lg"
                loading={reviewSubmitting}
              >
                {t("face_submit_review")}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
