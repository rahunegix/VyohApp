"use client";

import Link from "next/link";
import {
  ChevronRight, Bell, Lock, Ban, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { LogoutButton } from "@/components/auth/logout-button";

const SETTINGS_ITEMS = [
  { href: "/settings/privacy", label: "Privacy Settings", icon: Lock, desc: "Control what others see" },
  { href: "/settings/notifications", label: "Notifications", icon: Bell, desc: "Manage alerts" },
  { href: "/settings/blocked", label: "Blocked Users", icon: Ban, desc: "Manage blocked profiles" },
  { href: "/settings/delete", label: "Delete Account", icon: Trash2, desc: "Permanently remove account" },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader showBack title="Settings" />

      <div className="divide-y divide-border">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>

      <div className="mt-8 px-4">
        <LogoutButton />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Sign out of your account on this device
        </p>
      </div>
    </div>
  );
}
