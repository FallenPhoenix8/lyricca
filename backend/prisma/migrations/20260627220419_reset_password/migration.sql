-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_password_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT,
ALTER COLUMN "email" DROP DEFAULT;
