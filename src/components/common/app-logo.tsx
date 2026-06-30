import Image from "next/image";
import { APP_NAME, LOGO_PATH } from "@/lib/constants";
import { cn } from "@/lib/helpers/utils";

const LOGO_WIDTH = 432;
const LOGO_HEIGHT = 84;

type AppLogoProps = {
  className?: string;
  priority?: boolean;
};

/** Saathini wordmark — use `className` for height (e.g. `h-8 w-auto`). */
export function AppLogo({ className, priority = false }: AppLogoProps) {
  return (
    <Image
      src={LOGO_PATH}
      alt={APP_NAME}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      unoptimized
      className={cn("h-8 pt-4 px-2 w-auto object-contain object-left", className)}
    />
  );
}
