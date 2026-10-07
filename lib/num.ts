/* ==================================================================
   SỐ THỰC CHO TOẠ ĐỘ
   ---------------------------------------------------------------
   Math.cos/sin/hypot của V8 ở Node và ở trình duyệt có thể lệch nhau
   ở chữ số cuối cùng (khác phiên bản V8, khác nền tảng). Khi giá
   trị đó đi thẳng vào attribute SVG, server render ra
   "71.30453355601168" còn client render ra 71.3045335560117 → React báo
   hydration mismatch.

   Vì vậy mọi toạ độ tính bằng hàm lượng giác đều đi qua px() trước khi
   đưa vào DOM. Hai chữ số thập phân là quá đủ cho SVG (dưới 1px) nhưng
   đủ để hai môi trường luôn ra cùng một chuỗi.
   ================================================================== */

/** làm tròn về 2 chữ số thập phân — ổn định giữa server và client */
export function px(n: number): number {
  return Math.round(n * 100) / 100;
}
