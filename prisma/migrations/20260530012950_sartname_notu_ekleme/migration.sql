/*
  Warnings:

  - You are about to drop the column `iptalTarihi` on the `ihaleler` table. All the data in the column will be lost.
  - You are about to drop the column `sozlestirildiTarihi` on the `ihaleler` table. All the data in the column will be lost.
  - You are about to drop the column `teklifAlindiTarihi` on the `ihaleler` table. All the data in the column will be lost.
  - You are about to drop the column `yayinTarihi` on the `ihaleler` table. All the data in the column will be lost.
  - Made the column `kurumId` on table `ihaleler` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ihaleler"
  DROP COLUMN "iptalTarihi",
  DROP COLUMN "sozlestirildiTarihi",
  DROP COLUMN "teklifAlindiTarihi",
  DROP COLUMN "yayinTarihi";

ALTER TABLE "ihaleler" ALTER COLUMN "butce" SET DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ihaleler'
      AND column_name = 'kurumId'
  ) THEN
    EXECUTE 'ALTER TABLE "ihaleler" ALTER COLUMN "kurumId" SET NOT NULL';
  END IF;
END $$;
