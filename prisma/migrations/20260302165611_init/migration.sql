-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "MrfStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RFQ_SENT', 'PO_ISSUED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "PoStatus" AS ENUM ('ISSUED', 'DELIVERED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

-- CreateTable
CREATE TABLE "mst_customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_subsidiary" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_subsidiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_vendor" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "gstNo" TEXT,
    "panNo" TEXT,
    "contactPerson" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "vendorType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mst_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sw_user_details" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sw_user_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stk_category" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stk_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stk_group" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stk_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stk_manufacturer" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stk_manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stk_item_master" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "groupId" TEXT,
    "manufacturerId" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'Nos',
    "openingQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPurchaseDate" TIMESTAMP(3),
    "lastPurchaseRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stk_item_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrf_master" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "subsidiaryId" TEXT NOT NULL,
    "mrfNumber" TEXT NOT NULL,
    "status" "MrfStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "preferredVendor" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mrf_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrf_items" (
    "id" TEXT NOT NULL,
    "mrfId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "description" TEXT,
    "qty" DOUBLE PRECISION NOT NULL,
    "expectedRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "mrf_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_master" (
    "id" TEXT NOT NULL,
    "mrfId" TEXT NOT NULL,
    "rfqNumber" TEXT NOT NULL,
    "lastDateSubmission" TIMESTAMP(3),
    "status" "RfqStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_vendor_mapping" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "secureToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "quoteSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_vendor_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_quote_items" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "mappingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "technicalDetails" TEXT,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryDays" INTEGER,
    "warranty" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_master" (
    "id" TEXT NOT NULL,
    "mrfId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryPeriod" TEXT,
    "paymentTerms" TEXT,
    "termsConditions" TEXT,
    "status" "PoStatus" NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "po_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_inward" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "subsidiaryId" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_inward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_details" (
    "id" TEXT NOT NULL,
    "poId" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT,
    "referenceNo" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_store" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subsidiaryId" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'LOGIN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mst_subsidiary_code_key" ON "mst_subsidiary"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sw_user_details_email_key" ON "sw_user_details"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stk_item_master_code_key" ON "stk_item_master"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mrf_master_mrfNumber_key" ON "mrf_master"("mrfNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_master_rfqNumber_key" ON "rfq_master"("rfqNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_vendor_mapping_secureToken_key" ON "rfq_vendor_mapping"("secureToken");

-- CreateIndex
CREATE UNIQUE INDEX "po_master_poNumber_key" ON "po_master"("poNumber");

-- AddForeignKey
ALTER TABLE "mst_subsidiary" ADD CONSTRAINT "mst_subsidiary_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mst_vendor" ADD CONSTRAINT "mst_vendor_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sw_user_details" ADD CONSTRAINT "sw_user_details_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_category" ADD CONSTRAINT "stk_category_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_group" ADD CONSTRAINT "stk_group_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_manufacturer" ADD CONSTRAINT "stk_manufacturer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_item_master" ADD CONSTRAINT "stk_item_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_item_master" ADD CONSTRAINT "stk_item_master_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "stk_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_item_master" ADD CONSTRAINT "stk_item_master_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "stk_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stk_item_master" ADD CONSTRAINT "stk_item_master_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "stk_manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrf_master" ADD CONSTRAINT "mrf_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "mst_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrf_master" ADD CONSTRAINT "mrf_master_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "mst_subsidiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrf_items" ADD CONSTRAINT "mrf_items_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES "mrf_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrf_items" ADD CONSTRAINT "mrf_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "stk_item_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_master" ADD CONSTRAINT "rfq_master_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES "mrf_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_vendor_mapping" ADD CONSTRAINT "rfq_vendor_mapping_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfq_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_vendor_mapping" ADD CONSTRAINT "rfq_vendor_mapping_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "mst_vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_quote_items" ADD CONSTRAINT "vendor_quote_items_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "mst_vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_quote_items" ADD CONSTRAINT "vendor_quote_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "stk_item_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_quote_items" ADD CONSTRAINT "vendor_quote_items_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "rfq_vendor_mapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES "mrf_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "mst_vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_inward" ADD CONSTRAINT "goods_inward_poId_fkey" FOREIGN KEY ("poId") REFERENCES "po_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_inward" ADD CONSTRAINT "goods_inward_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "mst_subsidiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_poId_fkey" FOREIGN KEY ("poId") REFERENCES "po_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_store" ADD CONSTRAINT "otp_store_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "mst_subsidiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
