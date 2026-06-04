ALTER TABLE "sozlesmeler"
  ADD COLUMN IF NOT EXISTS "odemeVadesiGun" INTEGER NOT NULL DEFAULT 30;

ALTER TABLE "hakedisler"
  ADD COLUMN IF NOT EXISTS "onayTarihi" TIMESTAMP(3);

ALTER TABLE "hakedisler"
  ADD COLUMN IF NOT EXISTS "vadeTarihi" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "hakedisler_vadeTarihi_idx" ON "hakedisler"("vadeTarihi");
