export default function ProfileLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-24 bg-bg-surface border border-border-subtle rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-bg-elevated rounded-full" />
          <div className="space-y-2">
            <div className="h-5 bg-bg-elevated rounded w-40" />
            <div className="h-3 bg-bg-elevated rounded w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-bg-surface border border-border-subtle rounded-2xl p-4" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-40 bg-bg-surface border border-border-subtle rounded-2xl p-6" />
          <div className="h-40 bg-bg-surface border border-border-subtle rounded-2xl p-6" />
        </div>
      </div>
    </div>
  );
}
