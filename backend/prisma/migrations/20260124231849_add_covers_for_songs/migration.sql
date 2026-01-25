/*
  Warnings:

  - A unique constraint covering the columns `[cover_id]` on the table `songs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "cover_id" UUID;

-- CreateTable
CREATE TABLE "covers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "covers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_cover_id_key" ON "songs"("cover_id");

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "covers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
