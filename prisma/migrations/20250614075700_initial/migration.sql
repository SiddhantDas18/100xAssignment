-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_authorId_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "authorId" DROP NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "slug" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
