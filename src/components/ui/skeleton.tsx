import { cn } from "@/lib/helpers/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton rounded-[6px]", className)} {...props} />;
}

export function ProfileCardSkeleton({ fill = false }: { fill?: boolean }) {
  return (
    <div className={cn("space-y-4", fill ? "flex h-full flex-col p-0" : "p-4")}>
      <Skeleton className={cn("w-full rounded-2xl", fill ? "min-h-0 flex-1" : "h-80")} />
      {!fill && (
        <>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </>
      )}
      <div className="flex shrink-0 justify-center gap-4">
        <Skeleton className="h-12 w-12 rounded-[6px]" />
        <Skeleton className="h-12 w-12 rounded-[6px]" />
        <Skeleton className="h-14 w-14 rounded-[6px]" />
      </div>
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-[6px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function MagazineCoverSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] max-h-[420px] w-full rounded-[6px]" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-[6px]" />
    </div>
  );
}

export function SubscriptionSkeleton() {
  return (
    <div className="pb-12">
      <Skeleton className="h-52 w-full rounded-b-[6px]" />
      <div className="relative z-20 -mt-6 space-y-4 px-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-[6px]" />
        ))}
      </div>
    </div>
  );
}

export function SettingsMenuSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}
