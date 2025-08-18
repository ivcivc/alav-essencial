-- CreateTable
CREATE TABLE "partner_blocked_dates" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "blockedDate" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_blocked_dates_partnerId_blockedDate_startTime_endTi_key" ON "partner_blocked_dates"("partnerId", "blockedDate", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "partner_blocked_dates" ADD CONSTRAINT "partner_blocked_dates_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
