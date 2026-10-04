export default function TrackerLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse">
      {/* Stats Bar Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2">
            <div className="h-3 bg-bg-elevated rounded w-1/2" />
            <div className="h-6 bg-bg-elevated rounded w-1/3" />
          </div>
        ))}
      </div>
      {/* Kanban Board Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-3 min-h-[500px]">
            <div className="h-6 bg-bg-elevated rounded w-3/4 mb-4" />
            <div className="h-24 bg-bg-elevated rounded-lg" />
            <div className="h-24 bg-bg-elevated rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
