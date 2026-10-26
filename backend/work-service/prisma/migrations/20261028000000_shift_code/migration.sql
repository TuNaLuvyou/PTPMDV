-- Mã ca hiển thị cho người dùng: MC-XXXX (4 chữ số), thay cho cuid nội bộ.
-- Thêm cột dạng nullable trước, backfill dữ liệu hiện có theo thứ tự tạo ca,
-- rồi mới đặt NOT NULL + UNIQUE để tránh lỗi trên DB đang có sẵn bản ghi.
ALTER TABLE "shifts" ADD COLUMN "code" TEXT;

WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "shifts"
)
UPDATE "shifts" AS s
SET "code" = 'MC-' || LPAD(numbered.rn::text, 4, '0')
FROM numbered
WHERE s."id" = numbered."id";

ALTER TABLE "shifts" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "shifts_code_key" ON "shifts"("code");
