import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

async function ensureFile(filePath, fallback) {
  await mkdir(dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

export class JsonStore {
  constructor(dataDir) {
    this.usersPath = join(dataDir, 'users.json');
    this.refreshTokensPath = join(dataDir, 'refresh-tokens.json');
  }

  async init() {
    await ensureFile(this.usersPath, []);
    await ensureFile(this.refreshTokensPath, []);
  }

  async readUsers() {
    return JSON.parse(await readFile(this.usersPath, 'utf8'));
  }

  async writeUsers(users) {
    await atomicWrite(this.usersPath, users);
  }

  async readRefreshTokens() {
    return JSON.parse(await readFile(this.refreshTokensPath, 'utf8'));
  }

  async writeRefreshTokens(tokens) {
    await atomicWrite(this.refreshTokensPath, tokens);
  }
}

async function atomicWrite(filePath, value) {
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  await writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8');
  await rename(tempPath, filePath);
}
