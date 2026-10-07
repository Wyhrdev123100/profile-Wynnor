import { profile } from "@/data/profile";

/* ==================================================================
   PROFILE AVATAR
   ---------------------------------------------------------------
   Ảnh đại diện động (GIF / WebP) đặt trong lớp kính tròn, có:
     halo sáng phía sau → vành quỹ đạo quay chậm → khung kính →
     highlight chạy qua → nhãn HUD → chấm trạng thái.
   Mọi kích thước bên trong dùng đơn vị cqi nên tự co theo chiều
   rộng của khung chứa — không méo, không tràn, không crop sai mặt.

   Đổi ảnh: chỉ cần thay file trong public/ và sửa hai trường
   `avatar` / `avatarWebp` trong data/profile.ts. Ổn định kích thước
   được khai báo sẵn bằng width/height để trình duyệt không dịch layout.

   Kích thước luôn do phần tử cha quyết định (khung cha có aspect-square);
   `className` chỉ dùng để đặt vị trí, không dùng để đặt kích thước.
   ================================================================== */

export function ProfileAvatar({
  className = "",
  label,
}: {
  className?: string;
  /** Nhãn thay thế cho ảnh; mặc định lấy từ hồ sơ */
  label?: string;
}) {
  return (
    <span className={`avatar ${className}`}>
      <span aria-hidden className="avatar__halo" />
      <span aria-hidden className="avatar__orbit" />
      <span aria-hidden className="avatar__track" />

      <span className="avatar__frame">
        <picture>
          <source srcSet={profile.avatarWebp} type="image/webp" />
          <img
            src={profile.avatar}
            alt={label ?? `Ảnh đại diện của ${profile.name}`}
            width={360}
            height={267}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <span aria-hidden className="avatar__glass" />
        <span aria-hidden className="avatar__sheen" />
        <span aria-hidden className="avatar__hud">
          PROFILE.SYS
        </span>
      </span>

      <span className="avatar__status">
        <span className="sr-only">{profile.availability}</span>
      </span>
    </span>
  );
}