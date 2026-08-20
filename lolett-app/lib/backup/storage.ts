import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, sep } from 'node:path';

/**
 * Stockage des sauvegardes sur disque.
 *
 * Remplace `@vercel/blob`, inutilisable hors de Vercel. Les fichiers sont
 * écrits dans un volume persistant du VPS (monté sur BACKUP_DIR), ce qui
 * garde les sauvegardes hors du Supabase qu'elles sauvegardent.
 */
const ROOT = process.env.BACKUP_DIR ?? '/data/backups';

export type StoredFile = {
  /** Chemin relatif à la racine des sauvegardes, séparateurs POSIX. */
  path: string;
  modifiedAt: Date;
};

/**
 * Refuse tout chemin qui sortirait de la racine des sauvegardes. Les noms de
 * fichiers viennent de Supabase Storage, donc d'une source qu'on ne maîtrise
 * pas entièrement.
 */
function resolveSafe(relPath: string): string {
  const cleaned = normalize(relPath)
    .split(/[/\\]/)
    .filter((part) => part !== '' && part !== '.' && part !== '..')
    .join(sep);
  const absolute = join(ROOT, cleaned);
  if (absolute !== ROOT && !absolute.startsWith(ROOT + sep)) {
    throw new Error(`Chemin de sauvegarde invalide : ${relPath}`);
  }
  return absolute;
}

/** Écrit un fichier de sauvegarde et renvoie son chemin relatif. */
export async function putBackup(
  relPath: string,
  data: string | Uint8Array | ArrayBuffer | Blob,
): Promise<{ path: string }> {
  const absolute = resolveSafe(relPath);
  await mkdir(dirname(absolute), { recursive: true });

  let body: string | Uint8Array;
  if (typeof data === 'string') {
    body = data;
  } else if (data instanceof Blob) {
    body = new Uint8Array(await data.arrayBuffer());
  } else if (data instanceof ArrayBuffer) {
    body = new Uint8Array(data);
  } else {
    body = data;
  }

  await writeFile(absolute, body);
  return { path: relPath };
}

/** Liste récursivement les sauvegardes dont le chemin commence par `prefix`. */
export async function listBackups(prefix: string): Promise<StoredFile[]> {
  const found: StoredFile[] = [];

  async function walk(relDir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(join(ROOT, relDir), { withFileTypes: true });
    } catch {
      return; // dossier absent : aucune sauvegarde, pas une erreur
    }
    for (const entry of entries) {
      const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(relPath);
      } else if (relPath.startsWith(prefix)) {
        const info = await stat(join(ROOT, relPath));
        found.push({ path: relPath, modifiedAt: info.mtime });
      }
    }
  }

  await walk('');
  return found;
}

/** Lit une sauvegarde existante. */
export async function readBackup(relPath: string): Promise<Buffer> {
  return readFile(resolveSafe(relPath));
}
