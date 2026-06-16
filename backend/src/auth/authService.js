import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from '../security/passwords.js';
import { createAccessToken, createRefreshToken, hashToken, verifyAccessToken } from '../security/tokens.js';
import { normalizeEmail } from './validation.js';

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };
}

export class AuthService {
  constructor(store, config) {
    this.store = store;
    this.config = config;
  }

  async register({ email, password, name }) {
    const normalizedEmail = normalizeEmail(email);
    const users = await this.store.readUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      email: normalizedEmail,
      name,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now
    };

    users.push(user);
    await this.store.writeUsers(users);

    return this.createSession(user);
  }

  async login({ email, password }) {
    const users = await this.store.readUsers();
    const user = users.find((candidate) => candidate.email === normalizeEmail(email));

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    return this.createSession(user);
  }

  async createSession(user) {
    const refreshToken = createRefreshToken();
    const refreshTokenHash = hashToken(refreshToken, this.config.refreshTokenSecret);
    const expiresAt = new Date(Date.now() + this.config.refreshTokenTtlSeconds * 1000).toISOString();
    const tokens = await this.store.readRefreshTokens();

    tokens.push({
      id: randomUUID(),
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      createdAt: new Date().toISOString()
    });

    await this.store.writeRefreshTokens(tokens);

    return {
      user: publicUser(user),
      accessToken: createAccessToken({ sub: user.id, email: user.email }, this.config.accessTokenSecret, this.config.accessTokenTtlSeconds),
      refreshToken
    };
  }

  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw Object.assign(new Error('Refresh token is required'), { statusCode: 401 });
    }

    const refreshTokenHash = hashToken(rawRefreshToken, this.config.refreshTokenSecret);
    const tokens = await this.store.readRefreshTokens();
    const tokenRecord = tokens.find((token) => token.tokenHash === refreshTokenHash);

    if (!tokenRecord || new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    const users = await this.store.readUsers();
    const user = users.find((candidate) => candidate.id === tokenRecord.userId);

    if (!user) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    await this.revokeRefreshToken(rawRefreshToken);
    return this.createSession(user);
  }

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await this.revokeRefreshToken(rawRefreshToken);
    }
  }

  async getUserFromAccessToken(accessToken) {
    const payload = verifyAccessToken(accessToken, this.config.accessTokenSecret);
    const users = await this.store.readUsers();
    const user = users.find((candidate) => candidate.id === payload.sub);

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return publicUser(user);
  }

  async revokeRefreshToken(rawRefreshToken) {
    const refreshTokenHash = hashToken(rawRefreshToken, this.config.refreshTokenSecret);
    const tokens = await this.store.readRefreshTokens();
    await this.store.writeRefreshTokens(tokens.filter((token) => token.tokenHash !== refreshTokenHash));
  }
}
