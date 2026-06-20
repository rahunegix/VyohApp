"use client";

import * as React from "react";
import Image from "next/image";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn, getInitials } from "@/lib/helpers/utils";
import type { ProfilePhoto } from "@/types";

export interface PhotoGalleryProps {
  photos: ProfilePhoto[];
  name: string;
  className?: string;
  /** Prevents parent links/buttons from firing when swiping or tapping photos */
  isolateInteractions?: boolean;
}

export function PhotoGallery({
  photos,
  name,
  className,
  isolateInteractions = false,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter and sort photos
  const displayPhotos = React.useMemo(() => {
    return photos
      .filter((p) => !p.is_private)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [photos]);

  const totalPhotos = displayPhotos.length;
  const currentPhoto = displayPhotos[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < totalPhotos - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalPhotos]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isolateInteractions) {
      e.stopPropagation();
      e.preventDefault();
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.4) {
      handlePrev();
    } else if (x > width * 0.6) {
      handleNext();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isolateInteractions) e.stopPropagation();
  };

  if (totalPhotos === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[4/5] w-full bg-primary/10 flex items-center justify-center text-6xl font-bold text-primary",
          className
        )}
      >
        {getInitials(name)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative aspect-[4/5] w-full overflow-hidden bg-muted", className)}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {currentPhoto && (
            <Image
              src={currentPhoto.url}
              alt={`${name} photo ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="480px"
              priority={currentIndex === 0}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none z-10" />

      {/* Top Pagination & Counter */}
      {totalPhotos > 1 && (
        <div className="absolute top-4 left-0 right-0 p-4 z-20 flex items-center justify-between safe-top">
          {/* Pagination Bars */}
          <div className="flex gap-1.5 flex-1 mr-4">
            {displayPhotos.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 photo-dot",
                  idx === currentIndex ? "photo-dot-active" : "photo-dot-inactive"
                )}
              />
            ))}
          </div>

          {/* Counter Badge */}
          <div className="glass-dark px-2.5 py-1 rounded-full text-xs font-semibold text-white tracking-wide shadow-sm backdrop-blur-md">
            {currentIndex + 1} / {totalPhotos}
          </div>
        </div>
      )}
    </div>
  );
}
