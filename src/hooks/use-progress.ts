import { useProgressStore } from "@/store/progress";
import { withProgress, showProgress, hideProgress } from "@/lib/progress";

export function useProgress() {
  const visible = useProgressStore((s) => s.visible);
  const title = useProgressStore((s) => s.title);
  const show = useProgressStore((s) => s.show);
  const hide = useProgressStore((s) => s.hide);

  return { visible, title, show, hide, withProgress, showProgress, hideProgress };
}
