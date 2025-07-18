"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TransitionLoader({ message }: { message?: string }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // You can adjust the delay if needed
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 pointer-events-none">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
      {message && (
        <div className="mt-2 text-base text-gray-800 font-medium">{message}</div>
      )}
    </div>
  );
}
