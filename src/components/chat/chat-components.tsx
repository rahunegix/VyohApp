"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, CheckCheck, Shield, MapPin, X, HeartHandshake } from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/helpers/utils";
import { formatProfileLocation } from "@/lib/helpers/formatters";
import type { ChatRequest, Conversation, DiscoverProfile, Profile } from "@/types";

function getProfilePhoto(profile?: Profile | DiscoverProfile) {
  if (!profile || !("photos" in profile) || !profile.photos?.length) return null;
  const primary = profile.photos.find((p) => p.is_primary) ?? profile.photos[0];
  return primary?.url ?? null;
}

function ProfileAvatar({
  profile,
  size = "md",
  unread = false,
}: {
  profile?: Profile | DiscoverProfile;
  size?: "sm" | "md" | "lg";
  unread?: boolean;
}) {
  const photoUrl = getProfilePhoto(profile);
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-11 w-11" : "h-14 w-14";
  const textSize = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className={cn("relative shrink-0", sizeClass)}>
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-2xl bg-primary/10 shadow-sm ring-2 ring-white",
          unread && "ring-primary/30"
        )}
      >
        {photoUrl ? (
          <Image src={photoUrl} alt={profile?.full_name ?? "Profile"} fill className="object-cover" sizes="64px" />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center font-semibold text-primary", textSize)}>
            {profile ? getInitials(profile.full_name) : "?"}
          </div>
        )}
      </div>
      {unread && (
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-white shadow-sm" />
      )}
    </div>
  );
}

interface ChatListItemProps {
  conversation: Conversation;
  href: string;
}

export function ChatListItem({ conversation, href }: ChatListItemProps) {
  const profile = conversation.other_profile as DiscoverProfile | undefined;
  const unread = (conversation.unread_count ?? 0) > 0;
  const isVerified = profile && "verification" in profile && profile.verification?.face_verified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all active:scale-[0.99]",
          unread
            ? "border-primary/20 bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]"
            : "border-transparent bg-white/90 shadow-[var(--shadow-soft)] hover:border-border/50 hover:shadow-[var(--shadow-card)]"
        )}
      >
        <ProfileAvatar profile={profile} unread={unread} />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className={cn("truncate text-[15px]", unread ? "font-bold text-foreground" : "font-semibold text-foreground")}>
                {profile?.full_name ?? "Unknown"}
              </p>
              {isVerified && <Shield className="h-3.5 w-3.5 shrink-0 text-primary" fill="currentColor" />}
            </div>
            {conversation.last_message && (
              <span className={cn("shrink-0 text-xs font-medium", unread ? "text-primary" : "text-muted-foreground")}>
                {formatRelativeTime(conversation.last_message.created_at)}
              </span>
            )}
          </div>

          {profile && "city" in profile && (
            <p className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatProfileLocation(profile)}</span>
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className={cn("truncate text-sm", unread ? "font-medium text-foreground" : "text-muted-foreground")}>
              {conversation.last_message?.message_text ?? "Start a conversation"}
            </p>
            {unread && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface MessageBubbleProps {
  text: string;
  isOwn: boolean;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export function MessageBubble({ text, isOwn, timestamp, status }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex w-full mb-1", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
          isOwn
            ? "rounded-2xl rounded-tr-sm bg-primary text-white"
            : "rounded-2xl rounded-tl-sm border border-border/50 bg-white text-foreground"
        )}
      >
        <p>{text}</p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px] font-medium tracking-wide",
            isOwn ? "justify-end text-white/80" : "text-muted-foreground"
          )}
        >
          <span>{timestamp}</span>
          {isOwn && status === "read" && <CheckCheck className="h-3.5 w-3.5 text-blue-200" strokeWidth={2.5} />}
          {isOwn && status === "delivered" && <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />}
          {isOwn && status === "sent" && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-1 flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/50 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ChatRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: ChatRequest & { sender?: DiscoverProfile };
  onAccept: () => void;
  onReject: () => void;
}) {
  const sender = request.sender;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="overflow-hidden rounded-[1.25rem] border border-primary/15 bg-white shadow-[var(--shadow-card)]"
    >
      <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

      <div className="p-4">
        <div className="mb-4 flex items-start gap-3">
          <ProfileAvatar profile={sender} size="lg" />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-bold text-foreground">{sender?.full_name ?? "Someone"}</p>
            {sender && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {formatProfileLocation(sender)}
              </p>
            )}
            <p className="mt-1 text-xs font-medium text-primary">Wants to start a conversation</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border/40 bg-muted/30 p-3.5">
          <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{request.message}&rdquo;</p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onReject}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-white py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive active:scale-[0.98]"
          >
            <X className="h-4 w-4" />
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <HeartHandshake className="h-4 w-4" />
            Accept
          </button>
        </div>
      </div>
    </motion.div>
  );
}
