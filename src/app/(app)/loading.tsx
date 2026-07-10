export default function Loading() {
  return (
    <div className="space-y-8">
        <div className="space-y-3">
          <div className="shimmer h-3 w-28 rounded bg-line-strong" />
          <div className="shimmer h-9 w-72 max-w-full rounded bg-line-strong" />
          <div className="shimmer h-4 w-96 max-w-full rounded bg-line" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="rounded-lg bg-surface p-5 shadow-card"
            >
              <div className="shimmer h-4 w-24 rounded bg-line" />
              <div className="shimmer mt-4 h-8 w-16 rounded bg-line-strong" />
              <div className="shimmer mt-3 h-3 w-32 rounded bg-line" />
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-surface p-6 shadow-card">
          <div className="shimmer h-5 w-40 rounded bg-line-strong" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="shimmer h-12 w-full rounded-sm bg-line"
              />
            ))}
          </div>
        </div>
      </div>
  );
}
