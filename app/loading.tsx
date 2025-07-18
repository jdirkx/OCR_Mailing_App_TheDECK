export default function Loading({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 pointer-events-none">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
      {message && (
        <div className="mt-2 text-base text-gray-800 font-medium">{message}</div>
      )}
    </div>
  );
}