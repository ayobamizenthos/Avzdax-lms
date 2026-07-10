export function TopProgress() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div className="nav-progress-bar h-full rounded-r-full bg-ink shadow-[0_0_8px_rgba(10,11,13,0.35)]" />
    </div>
  );
}
