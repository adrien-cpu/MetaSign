import fs from "fs";
import { execSync } from "child_process";

// 📂 Définition des dossiers
const sourceDir = "./src";
const docsDir = "./docs";
const missingReportPath = `${docsDir}/missing_jsdoc_report.txt`;
const jsDocReportPath = `${docsDir}/jsdoc_files_report.txt`;

// 📂 Créer le dossier `docs/` s'il n'existe pas
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

function isValidTypeScript(filePath) {
    try {
        execSync(`npx tsc --noEmit --skipLibCheck ${filePath}`, { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}


// 🔍 Fonction pour vérifier si un fichier contient un commentaire JSDoc
function containsJsDoc(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    return /\/\*\*[\s\S]+?\*\//.test(content); // Vérifie s'il y a un vrai commentaire JSDoc
}

// 📂 Scanner tous les fichiers JS/TS
const files = execSync(`find ${sourceDir} -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\)`)
    .toString()
    .trim()
    .split("\n");

console.log(`📂 ${files.length} fichiers trouvés`);

const jsDocFiles = [];
const missingJsDocFiles = [];

files.forEach(file => {
    if (containsJsDoc(file) && isValidTypeScript(file)) {
        jsDocFiles.push(file);
    } else {
        missingJsDocFiles.push(file);
    }
});


// 📋 Enregistrement des fichiers AVEC JSDoc
if (jsDocFiles.length > 0) {
    fs.writeFileSync(jsDocReportPath, jsDocFiles.join("\n"));
    console.log(`✅ Rapport des fichiers AVEC JSDoc généré : ${jsDocReportPath} (${jsDocFiles.length} fichiers documentés)`);
} else {
    console.log("⚠️ Aucun fichier avec JSDoc détecté, rapport non généré.");
}

// 📋 Enregistrement des fichiers SANS JSDoc
if (missingJsDocFiles.length > 0) {
    fs.writeFileSync(missingReportPath, missingJsDocFiles.join("\n"));
    console.log(`📋 Rapport des fichiers SANS JSDoc généré : ${missingReportPath} (${missingJsDocFiles.length} fichiers sans documentation)`);
} else {
    console.log("✅ Tous les fichiers ont des JSDoc !");
}

// 📖 Générer la documentation uniquement pour les fichiers bien documentés
if (jsDocFiles.length > 0) {
    console.log("🔍 Vérification des fichiers avec JSDoc :", jsDocFiles);

    try {
        execSync(`npx typedoc --entryPointStrategy expand --entryPoints ${jsDocFiles.join(" ")} --out ${docsDir}`, { stdio: "inherit" });
        console.log(`✅ Documentation générée avec succès dans ${docsDir}/`);
    } catch (error) {
        console.error(`❌ Erreur lors de la génération de la documentation : ${error.message}`);
    }
} else {
    console.log("⚠️ Aucun fichier avec JSDoc trouvé. Documentation non générée.");
}
