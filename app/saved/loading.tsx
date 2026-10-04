export default function SavedLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-bg-surface border border-border-subtle rounded-xl w-48 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-bg-surface border border-border-subtle rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-bg-elevated rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-bg-elevated rounded w-48" />
                <div className="h-3 bg-bg-elevated rounded w-24" />
              </div>
            </div>
            <div className="w-24 h-8 bg-bg-elevated rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
