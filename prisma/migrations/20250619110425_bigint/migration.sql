/*
  Warnings:

  - You are about to alter the column `total_views` on the `users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `views_count` on the `videos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "total_views" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "videos" ALTER COLUMN "views_count" SET DATA TYPE INTEGER;
