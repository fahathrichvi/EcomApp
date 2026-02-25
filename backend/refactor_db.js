import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip files that shouldn't be touched
    if (filePath.endsWith('database.js')) return;

    // Change (req, res) => to async (req, res) =>
    content = content.replace(/(?<!async\s+)\(req,\s*res\)\s*=>/g, 'async (req, res) =>');

    // Add async to specific Express signatures if not present
    content = content.replace(/(?<!async\s+)\(req,\s*res,\s*next\)\s*=>/g, 'async (req, res, next) =>');

    // Add await to db. calls
    content = content.replace(/(?<!await\s+)db\.([a-zA-Z]+)\(/g, 'await db.$1(');

    // Special cases for helper methods like logActivity
    content = content.replace(/logActivity\(/g, 'await logActivity(');
    content = content.replace(/export async function logActivity/g, 'export const logActivity = async');
    // if logActivity is just exported as export function logActivity
    content = content.replace(/export function logActivity/g, 'export async function logActivity');

    fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

traverseDir(SRC_DIR);

// also process server.js
let serverContent = fs.readFileSync('src/server.js', 'utf8');
serverContent = serverContent.replace(/(?<!await\s+)db\.([a-zA-Z]+)\(/g, 'await db.$1(');
fs.writeFileSync('src/server.js', serverContent, 'utf8');

console.log('Refactoring complete.');
