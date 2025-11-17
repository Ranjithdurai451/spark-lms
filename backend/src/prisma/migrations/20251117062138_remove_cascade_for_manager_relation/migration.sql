-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_managerId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
