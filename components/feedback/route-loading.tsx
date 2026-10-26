export function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center bg-white dark:bg-[#0B0D12]">
      <div
        className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
