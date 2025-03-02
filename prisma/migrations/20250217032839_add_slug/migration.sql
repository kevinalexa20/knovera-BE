/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'temp-slug';

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
