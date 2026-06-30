import { useProgressStore } from "@/store/progress";

/** Global blocking progress overlay (BikePe-style). */
export async function withProgress<T>(title: string, fn: () => Promise<T>): Promise<T> {
  const { show, hide } = useProgressStore.getState();
  show(title);
  try {
    return await fn();
  } finally {
    hide();
  }
}

export function showProgress(title = "Please wait…") {
  useProgressStore.getState().show(title);
}

export function hideProgress() {
  useProgressStore.getState().hide();
}
