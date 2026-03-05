/**
 * Uploada a pasta dist/ para um bucket público do Supabase Storage.
 * Lê SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env na raiz (ou do ambiente).
 * Crie um bucket "web" público no painel Supabase antes de rodar.
 */
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const BUCKET = process.env.SUPABASE_BUCKET || 'web';

// Carrega .env da raiz se existir (para não precisar passar vars no terminal)
try {
  const envPath = join(ROOT, '.env');
  const envText = await readFile(envPath, 'utf-8');
  for (const line of envText.split('\n')) {
    const m = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
} catch (_) {}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Defina no .env (ou no ambiente):');
  console.error('  SUPABASE_URL ou VITE_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY (recomendado para upload) ou VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function walk(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      files.push(...(await walk(join(dir, e.name), rel)));
    } else {
      files.push(rel);
    }
  }
  return files;
}

function contentType(path) {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

async function main() {
  const files = await walk(DIST);
  console.log(`Encontrados ${files.length} arquivos em dist/`);
  for (const rel of files) {
    const buf = await readFile(join(DIST, rel));
    const { error } = await supabase.storage.from(BUCKET).upload(rel, buf, {
      contentType: contentType(rel),
      upsert: true,
    });
    if (error) {
      console.error(`Erro em ${rel}:`, error.message);
    } else {
      console.log(`  OK ${rel}`);
    }
  }
  const publicUrl = `${url.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/index.html`;
  console.log('\nDeploy concluído. Abra:', publicUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
