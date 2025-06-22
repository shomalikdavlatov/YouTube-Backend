/*
  Warnings:

  - Added the required column `slug` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "slug" TEXT NOT NULL;
