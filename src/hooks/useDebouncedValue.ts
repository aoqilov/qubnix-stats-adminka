import { useEffect, useState } from "react";

/** Qiymat `delay` ms o'zgarmay tursa qaytadi — qidiruvda har harfga so'rov ketmasin. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
