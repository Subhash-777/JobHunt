export default function ResumeLabLoading() {
  return (
    <div className="w-full min-h-[70vh] p-6 space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-10 bg-bg-surface border border-border-subtle rounded-xl w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-bg-surface border border-border-subtle rounded-2xl p-6" />
        <div className="h-64 bg-bg-surface border border-border-subtle rounded-2xl p-6" />
      </div>
    </div>
  );
}
