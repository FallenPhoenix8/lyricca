/*
  Warnings:

  - You are about to drop the column `author_id` on the `songs` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_author_id_fkey";

-- AlterTable
ALTER TABLE "songs" DROP COLUMN "author_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
