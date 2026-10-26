-- Bổ sung 2 trường mà form phân công ca gửi lên (note, isRecurring).
-- Trước đây thiếu cột nên prisma.shift.create() fail âm thầm -> ca chỉ nằm in-memory, reload là mất.
ALTER TABLE "shifts"
  ADD COLUMN IF NOT EXISTS "note" TEXT,
  ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN NOT NULL DEFAULT true;
