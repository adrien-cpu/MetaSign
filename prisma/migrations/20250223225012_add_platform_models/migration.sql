-- CreateTable
CREATE TABLE "CulturalHub" (
    "id" TEXT NOT NULL,
    "tourName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CulturalHub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gaming" (
    "id" TEXT NOT NULL,
    "tournamentName" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Gaming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" TEXT NOT NULL,
    "productionName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Travel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Travel_pkey" PRIMARY KEY ("id")
);
