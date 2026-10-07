/* ==================================================================
   BUS SỰ KIỆN NHỎ
   ------------------------------------------------------------------
   Dùng cho vài lệnh xuyên component (mở vũ trụ từ hero, bật/tắt
   nhạc từ console…). Chọn bus thay vì React context vì lý do đúng:
   các lệnh này hiếm, một chiều, và không ai trong cây cần re-render
   chỉ vì một node con tự bật/tắt. Context sẽ kéo toàn bộ cây xuống
   render lại mỗi lần bật nhạc — bus thì không.
   ================================================================== */

export type BusEvents = {
  /** mở overlay "My Universe" */
  "universe:open": { origin?: "hero" | "section" | "palette" } | undefined;
  /** đóng overlay */
  "universe:close": undefined;
  /** bật/tắt phát nhạc */
  "music:toggle": undefined;
};

type Handler<T> = (payload: T) => void;

const handlers = new Map<string, Set<Handler<never>>>();

export function on<K extends keyof BusEvents>(
  type: K,
  handler: Handler<BusEvents[K]>,
): () => void {
  let set = handlers.get(type);
  if (!set) {
    set = new Set();
    handlers.set(type, set);
  }
  set.add(handler as Handler<never>);
  return () => {
    set!.delete(handler as Handler<never>);
    if (set!.size === 0) handlers.delete(type);
  };
}

export function emit<K extends keyof BusEvents>(type: K, payload?: BusEvents[K]): void {
  const set = handlers.get(type);
  if (!set) return;
  for (const handler of set) (handler as Handler<BusEvents[K]>)(payload as BusEvents[K]);
}