export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-muted rounded animate-pulse w-1/3" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeletonHero() {
  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <div className="space-y-8">
        <div className="gap-2 flex justify-between">
          <div className="flex-col flex flex-1 space-y-1.5">
            <div className="h-12 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-6 bg-muted rounded animate-pulse w-5/6" />
          </div>
          <div className="h-28 w-28 rounded-full bg-muted animate-pulse flex-shrink-0" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse w-full" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
