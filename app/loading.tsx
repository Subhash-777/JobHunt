export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[70vh] space-y-6 animate-pulse">
      <div className="h-32 bg-bg-surface border border-border-subtle rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-bg-elevated rounded-xl" />
              <div className="w-10 h-10 bg-bg-elevated rounded-full" />
            </div>
            <div className="h-5 bg-bg-elevated rounded w-3/4" />
            <div className="h-4 bg-bg-elevated rounded w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-bg-elevated rounded-full" />
              <div className="h-6 w-16 bg-bg-elevated rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
