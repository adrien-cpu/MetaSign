const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🔥 Insertion des clubs en base...");

    await prisma.club.createMany({
        data: [
            {
                id: "humour-sourd",
                name: "Humour Sourd",
                description: "Partagez des blagues et expressions humoristiques en langue des signes !",
                memberCount: 0,
            },
            {
                id: "etymologie",
                name: "Étymologie des Signes",
                description: "Découvrez l'origine et l'évolution des signes à travers les cultures.",
                memberCount: 0,
            },
            {
                id: "signes-regionaux",
                name: "Signes Régionaux",
                description: "Comparez et documentez les différences entre les variantes régionales.",
                memberCount: 0,
            },
            {
                id: "interpretation-emotionnelle",
                name: "Interprétation Émotionnelle",
                description: "Comment les émotions sont traduites en langue des signes ?",
                memberCount: 0,
            },
            {
                id: "nouveaux-signes",
                name: "Nouveaux Signes & Néologismes",
                description: "Explorez l'apparition de nouveaux signes dans la LS.",
                memberCount: 0,
            },
            {
                id: "histoire-sourd",
                name: "Histoire Sourd",
                description: "Apprenez l'histoire et les luttes de la communauté sourde.",
                memberCount: 0,
            },
        ],
    });

    console.log("✅ Clubs insérés avec succès !");
}

main()
    .catch((e) => {
        console.error("❌ Erreur lors de l'insertion :", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
