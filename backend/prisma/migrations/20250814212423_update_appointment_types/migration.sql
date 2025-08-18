/*
  Warnings:

  - The values [NEW] on the enum `AppointmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentType_new" AS ENUM ('CONSULTATION', 'EXAM', 'PROCEDURE', 'RETURN');
ALTER TABLE "appointments" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "type" TYPE "AppointmentType_new" USING ("type"::text::"AppointmentType_new");
ALTER TYPE "AppointmentType" RENAME TO "AppointmentType_old";
ALTER TYPE "AppointmentType_new" RENAME TO "AppointmentType";
DROP TYPE "AppointmentType_old";
ALTER TABLE "appointments" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION';
COMMIT;

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "type" SET DEFAULT 'CONSULTATION';
