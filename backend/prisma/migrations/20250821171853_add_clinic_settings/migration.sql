-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Clínica Essencial',
    "hours" JSONB NOT NULL,
    "allowWeekendBookings" BOOLEAN NOT NULL DEFAULT false,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 30,
    "minBookingHours" INTEGER NOT NULL DEFAULT 2,
    "maxBookingDays" INTEGER NOT NULL DEFAULT 60,
    "allowCancelledMovement" BOOLEAN NOT NULL DEFAULT false,
    "allowCompletedMovement" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
