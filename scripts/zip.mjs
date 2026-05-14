import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import archiver from 'archiver';

const ROOT = new URL('..', import.meta.url).pathname;

function createZip(outputPath, addFiles) {
    return new Promise((resolve, reject) => {
        const out = createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        out.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(out);

        addFiles(archive);
        archive.finalize();
    });
}

async function glob(dir, pattern) {
    const results = [];
    async function walk(current) {
        const entries = await readdir(current, { withFileTypes: true });
        for (const e of entries) {
            const full = join(current, e.name);
            if (e.isDirectory()) {
                await walk(full);
            } else if (pattern.test(e.name)) {
                results.push(full);
            }
        }
    }
    await walk(dir);
    return results;
}

const zipDir = join(ROOT, 'public/zip');
if (!existsSync(zipDir)) mkdirSync(zipDir, { recursive: true });

// data.zip — all .txt under src/data/
await createZip(join(zipDir, 'data.zip'), (archive) => {
    archive.glob('**/*.txt', { cwd: join(ROOT, 'src/data') });
});
console.log('data.zip done');

// resources.zip — all .m4a under src/music/ (non-egg)
await createZip(join(zipDir, 'resources.zip'), (archive) => {
    archive.glob('**/music/*.m4a', { cwd: join(ROOT, 'src') });
});
console.log('resources.zip done');

// egg.zip — all .m4a under src/music/egg/
await createZip(join(zipDir, 'egg.zip'), (archive) => {
    archive.glob('*.m4a', { cwd: join(ROOT, 'src/music/egg') });
});
console.log('egg.zip done');
