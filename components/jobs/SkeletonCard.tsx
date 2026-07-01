export function SkeletonCard() {
  return (
    <div className="job-card p-5 h-40 flex flex-col gap-4 skeleton w-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 w-3/4">
          <div className="h-6 w-1/2 bg-white/5 rounded-md" />
          <div className="h-4 w-1/3 bg-white/5 rounded-md" />
        </div>
        <div className="h-10 w-10 bg-white/5 rounded-full" />
      </div>
      <div className="mt-auto flex gap-2">
        <div className="h-6 w-20 bg-white/5 rounded-md" />
        <div className="h-6 w-24 bg-white/5 rounded-md" />
        <div className="h-6 w-16 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}
