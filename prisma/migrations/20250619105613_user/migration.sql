/*
  Warnings:

  - You are about to drop the column `channelBanner` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `channelDescription` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscribersCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalViews` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "channelBanner",
DROP COLUMN "channelDescription",
DROP COLUMN "subscribersCount",
DROP COLUMN "totalViews",
ADD COLUMN     "channel_banner" TEXT,
ADD COLUMN     "channel_description" TEXT,
ADD COLUMN     "subscribers_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_views" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "videos_count" INTEGER NOT NULL DEFAULT 0;
