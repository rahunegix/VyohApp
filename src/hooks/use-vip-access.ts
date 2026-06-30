"use client";

import { useEffect, useState } from "react";
import type { VipAccessState } from "@/lib/vip/constants";

export function useVipAccess() {
  const [vipAccess, setVipAccess] = useState<boolean | null>(null);
  const [vipStatus, setVipStatus] = useState<VipAccessState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payments")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setVipAccess(Boolean(json.vip_access));
        setVipStatus((json.vip_status as VipAccessState) ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setVipAccess(false);
          setVipStatus("subscribe_required");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { vipAccess, vipStatus };
}
