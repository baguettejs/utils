import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Scanne automatiquement les controllers à partir du rootDir défini dans tsconfig.json
 */
export async function scanControllersFromTsConfig() {
    const tsconfigPath = path.resolve("tsconfig.json");

    if (!fs.existsSync(tsconfigPath)) {
        throw new Error("❌ Fichier tsconfig.json introuvable à la racine du projet");
    }

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    const rootDir = tsconfig.compilerOptions?.rootDir || "src";
    const baseDir = path.resolve(rootDir, "controllers");

    await scanControllers(baseDir);
}

/**
 * Scanne récursivement un dossier pour importer tous les fichiers *.controller.ts/js
 */
export async function scanControllers(baseDir: string) {
    if (!fs.existsSync(baseDir)) return;

    const files = fs.readdirSync(baseDir);

    for (const file of files) {
        const fullPath = path.join(baseDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            await scanControllers(fullPath);
        } else if (/\.controller\.(t|j)s$/.test(file)) {
            const fileUrl = pathToFileURL(fullPath).href;

            try {
                await import(fileUrl);
                console.log(`✅ Controller chargé : ${file}`);
            } catch (err) {
                console.error(`❌ Erreur lors du chargement de ${file}:`, err);
            }
        }
    }
}
