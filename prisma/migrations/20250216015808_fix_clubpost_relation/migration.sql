-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PROFESSOR';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "ClubMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPost" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,

    CONSTRAINT "ClubPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "clubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "vote" BOOLEAN NOT NULL,

    CONSTRAINT "ArtifactVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryCorrection" (
    "id" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "incorrectTranslation" TEXT NOT NULL,
    "suggestedCorrection" TEXT NOT NULL,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "clubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlossaryCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectionVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "correctionId" TEXT NOT NULL,
    "vote" BOOLEAN NOT NULL,

    CONSTRAINT "CorrectionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "Club"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMembership_userId_clubId_key" ON "ClubMembership"("userId", "clubId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactVote_userId_artifactId_key" ON "ArtifactVote"("userId", "artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "CorrectionVote_userId_correctionId_key" ON "CorrectionVote"("userId", "correctionId");

-- AddForeignKey
ALTER TABLE "ClubMembership" ADD CONSTRAINT "ClubMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMembership" ADD CONSTRAINT "ClubMembership_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPost" ADD CONSTRAINT "ClubPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPost" ADD CONSTRAINT "ClubPost_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactVote" ADD CONSTRAINT "ArtifactVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactVote" ADD CONSTRAINT "ArtifactVote_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryCorrection" ADD CONSTRAINT "GlossaryCorrection_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectionVote" ADD CONSTRAINT "CorrectionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectionVote" ADD CONSTRAINT "CorrectionVote_correctionId_fkey" FOREIGN KEY ("correctionId") REFERENCES "GlossaryCorrection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
