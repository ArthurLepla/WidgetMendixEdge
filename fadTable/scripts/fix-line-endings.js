const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Extensions à traiter
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html'];

// Dossiers à ignorer
const ignoreDirs = ['node_modules', 'dist', '.git'];

async function fixLineEndings(dir) {
    try {
        const files = await readdir(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await stat(filePath);
            
            // Ignorer les dossiers à exclure
            if (stats.isDirectory() && !ignoreDirs.includes(file)) {
                await fixLineEndings(filePath);
            } else if (stats.isFile() && extensions.includes(path.extname(file))) {
                try {
                    // Lire le contenu du fichier
                    const content = await readFile(filePath, 'utf8');
                    
                    // Convertir CRLF en LF
                    const fixedContent = content.replace(/\r\n/g, '\n');
                    
                    // Écrire le contenu corrigé
                    if (content !== fixedContent) {
                        await writeFile(filePath, fixedContent, 'utf8');
                        console.log(`Fixed line endings in: ${filePath}`);
                    }
                } catch (error) {
                    console.error(`Error processing file ${filePath}:`, error);
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
}

// Dossier racine du projet (chemin relatif depuis l'emplacement du script)
const rootDir = path.resolve(__dirname, '..');

// Démarrer la correction
console.log('Starting line ending normalization...');
fixLineEndings(rootDir)
    .then(() => console.log('Line ending normalization completed!'))
    .catch(err => console.error('Error during normalization:', err)); 