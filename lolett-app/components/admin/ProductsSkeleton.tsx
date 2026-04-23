export function ProductsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-9 w-40 rounded bg-[#B89547]/10 animate-pulse" />
          <div className="h-4 w-64 rounded bg-[#B89547]/10 animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-[#B89547]/10 animate-pulse" />
      </div>
      <div className="h-10 w-full rounded-lg bg-[#B89547]/10 animate-pulse" />
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="h-8 w-32 rounded bg-[#B89547]/10 animate-pulse" />
          <div className="h-48 rounded-xl bg-[#B89547]/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
