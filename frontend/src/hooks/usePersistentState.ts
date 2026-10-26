"use client";

import { useCallback, useSyncExternalStore } from "react";

// ============================================================
// usePersistentState — giữ state UI qua localStorage (F5 không mất).
// Dùng useSyncExternalStore để SSR/hydration an toàn: server render
// giá trị mặc định, client đọc localStorage rồi re-render — không lệch HTML.
// Chỉ dùng cho primitive (string/number/boolean) hoặc fallback là hằng số,
// vì getServerSnapshot phải trả về cùng giá trị giữa các lần render.
// ============================================================

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
// Cache snapshot theo raw string để getSnapshot trả cùng tham chiếu khi không đổi
// (bắt buộc với useSyncExternalStore, tránh vòng lặp render).
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>();

function emit(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

function getSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const cached = snapshotCache.get(key);
  // raw khác -> đọc lại; raw null (chưa lưu) thì chỉ dùng cache nếu fallback không đổi.
  if (cached && cached.raw === raw && (raw !== null || Object.is(cached.value, fallback))) {
    return cached.value as T;
  }
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  snapshotCache.set(key, { raw, value });
  return value;
}

export function usePersistentState<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (onStoreChange: Listener) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onStoreChange);
      return () => {
        listeners.get(key)?.delete(onStoreChange);
      };
    },
    [key]
  );

  const value = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot(key, fallback);
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      const raw = JSON.stringify(resolved) ?? "null";
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        return;
      }
      snapshotCache.set(key, { raw, value: resolved });
      emit(key);
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}
