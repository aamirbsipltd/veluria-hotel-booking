-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "partnerOrderId" TEXT NOT NULL,
    "etgOrderId" TEXT,
    "itemId" TEXT,
    "status" TEXT NOT NULL,
    "hid" INTEGER NOT NULL,
    "hotelName" TEXT NOT NULL,
    "checkin" TIMESTAMP(3) NOT NULL,
    "checkout" TIMESTAMP(3) NOT NULL,
    "guestsJson" TEXT NOT NULL,
    "bookHash" TEXT NOT NULL,
    "totalAmount" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "leadGuestFirst" TEXT NOT NULL,
    "leadGuestLast" TEXT NOT NULL,
    "leadGuestEmail" TEXT NOT NULL,
    "leadGuestPhone" TEXT,
    "cancellationJson" TEXT NOT NULL,
    "freeCancelBefore" TIMESTAMP(3),
    "rawFormResponse" TEXT,
    "rawFinishResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_partnerOrderId_key" ON "Booking"("partnerOrderId");
