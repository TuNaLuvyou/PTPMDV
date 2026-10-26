-- Bổ sung đầy đủ thuộc tính nhiệm vụ mà web/mobile gửi lên.
-- Trước đây các field này không có trong bảng tasks nên Prisma create/update
-- thất bại và service âm thầm ghi vào memory -> reload là mất.
ALTER TABLE "tasks" ADD COLUMN "assignedToName" TEXT;
ALTER TABLE "tasks" ADD COLUMN "assignedToEmail" TEXT;
ALTER TABLE "tasks" ADD COLUMN "assignedByName" TEXT;
ALTER TABLE "tasks" ADD COLUMN "shiftName" TEXT;
ALTER TABLE "tasks" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'manager';
ALTER TABLE "tasks" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE "tasks" ADD COLUMN "completedAt" TEXT;
ALTER TABLE "tasks" ADD COLUMN "requirePhoto" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tasks" ADD COLUMN "proofPhotoUrl" TEXT;
ALTER TABLE "tasks" ADD COLUMN "photoSubmittedBy" TEXT;
ALTER TABLE "tasks" ADD COLUMN "photoSubmittedAt" TEXT;
