import fs from "fs";
import path from "path";
import { ESLint } from "eslint";
import { execSync } from "child_process";
import { DirectoryLoader } from "@langchain/community/loaders/fs";
import { FAISS } from "langchain/vectorstores";
import { HuggingFaceEmbeddings } from "langchain/embeddings";

// 📂 Définition des dossiers
const sourceDir = "metasign"; // Projet d'origine
const cleanDir = "metasign_starcoder2"; // Dossier avec fichiers valides
const reportPath = "validation_report.txt"; // Rapport des erreurs

let reportContent = "📌 Rapport de validation des fichiers\n\n"; // ✅ Défini globalement

// 🔍 Vérifie si un fichier TypeScript est valide
function isValidTypeScript(filePath) {
    try {
        execSync(`npx tsc --noEmit --skipLibCheck ${filePath}`, { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}

// 🔍 Vérifie si un fichier respecte ESLint
async function isValidESLint(filePath) {
    try {
        const eslint = new ESLint();
        const results = await eslint.lintFiles([filePath]);
        const errors = results.flatMap(result => result.messages.map(msg => msg.message));

        return errors.length === 0 ? true : errors.join("; "); // ✅ Retourne les erreurs en string
    } catch (error) {
        return `Erreur ESLint : ${error.message}`;
    }
}

// 📂 Vérifie et copie les fichiers propres en conservant la structure des dossiers
async function scanDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const relativePath = path.relative(sourceDir, itemPath);
        const cleanPath = path.join(cleanDir, relativePath);

        if (fs.statSync(itemPath).isDirectory()) {
            if (!fs.existsSync(cleanPath)) {
                fs.mkdirSync(cleanPath, { recursive: true });
            }
            await scanDirectory(itemPath);
        } else if (item.endsWith(".tsx") || item.endsWith(".ts") || item.endsWith(".js")) {
            const tsValidation = isValidTypeScript(itemPath);
            const eslintValidation = await isValidESLint(itemPath);

            if (tsValidation === true && eslintValidation === true) {
                fs.copyFileSync(itemPath, cleanPath);
                console.log(`✅ Fichier copié : ${relativePath}`);
            } else {
                const errors = [
                    tsValidation !== true ? `TypeScript: ${tsValidation}` : null,
                    eslintValidation !== true ? `ESLint: ${eslintValidation}` : null
                ].filter(Boolean).join(" | ");

                reportContent += `❌ ${relativePath} : ${errors}\n`;
                console.log(`❌ Fichier rejeté : ${relativePath} | ${errors}`);
            }
        }
    }
}

// 📂 Vérifie et copie les fichiers propres
async function processFiles() {
    if (!fs.existsSync(cleanDir)) {
        fs.mkdirSync(cleanDir, { recursive: true });
    }

    await scanDirectory(sourceDir);
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Rapport généré : ${reportPath}`);
}

// 🧠 Indexer les fichiers propres pour le RAG
async function indexProject() {
    try {
        const loader = new DirectoryLoader(cleanDir, { glob: "**/*.{js,ts,tsx}" });
        const docs = await loader.load();

        const embeddings = new HuggingFaceEmbeddings();
        const vectorstore = await FAISS.fromDocuments(docs, embeddings);

        await vectorstore.save("vectorstore");
        console.log("✅ Indexation des fichiers propres terminée !");
    } catch (error) {
        console.error("❌ Erreur lors de l'indexation :", error.message);
    }
}

// 🚀 Exécuter tout le processus en une seule commande
(async function () {
    console.log("📂 Début du traitement du projet...");
    await processFiles();
    await indexProject();
    console.log("🎯 Processus terminé !");
})();
