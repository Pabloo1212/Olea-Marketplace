export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-olive-200 border-t-olive-700 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-olive-600 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}
