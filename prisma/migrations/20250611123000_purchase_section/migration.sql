-- CreateTable
CREATE TABLE "CheckCourse" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "purhcaseAmount" INTEGER NOT NULL,

    CONSTRAINT "CheckCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckCourse_id_key" ON "CheckCourse"("id");

-- AddForeignKey
ALTER TABLE "CheckCourse" ADD CONSTRAINT "CheckCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
