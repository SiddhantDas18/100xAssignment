-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
