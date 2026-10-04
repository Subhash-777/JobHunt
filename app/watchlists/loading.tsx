export default function WatchlistsLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-10 bg-bg-surface border border-border-subtle rounded-xl w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-3">
            <div className="h-5 bg-bg-elevated rounded w-1/2" />
            <div className="h-4 bg-bg-elevated rounded w-3/4" />
            <div className="h-6 bg-bg-elevated rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
