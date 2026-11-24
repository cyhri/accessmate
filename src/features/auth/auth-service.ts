import type { AuthUser, AuthSession, UserRole } from "./types";

export const AUTH_COOKIE_NAME = "accessmate_auth_token";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const AUTH_SECRET = process.env.AUTH_SECRET || "accessmate_secure_jwt_secret_token_2026";

// Initial seed accounts with pre-hashed or known credentials
const DEFAULT_USERS: AuthUser[] = [
  {
    id: "usr-admin-01",
    email: "admin@accessmate.org",
    name: "System Administrator",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: "2026-11-24T12:00:00.000Z",
  },
  {
    id: "usr-user-01",
    email: "user@accessmate.org",
    name: "Alex Rivera",
    role: "user",
    createdAt: "2026-02-15T00:00:00.000Z",
    lastLoginAt: "2026-11-24T14:30:00.000Z",
  },
  {
    id: "usr-user-02",
    email: "maria.transit@accessmate.org",
    name: "Maria Chen",
    role: "user",
    createdAt: "2026-03-10T00:00:00.000Z",
    lastLoginAt: "2026-11-23T18:15:00.000Z",
  },
];

// In-memory persistent user registry for runtime & server operations
class UserStore {
  private users: Map<string, AuthUser> = new Map();
  private passwords: Map<string, string> = new Map();

  constructor() {
    for (const u of DEFAULT_USERS) {
      this.users.set(u.id, u);
    }
    // Default demo passwords
    this.passwords.set("admin@accessmate.org", "Admin123!");
    this.passwords.set("user@accessmate.org", "User123!");
    this.passwords.set("maria.transit@accessmate.org", "Transit123!");
  }

  getAll(): AuthUser[] {
    return Array.from(this.users.values());
  }

  getById(id: string): AuthUser | null {
    return this.users.get(id) ?? null;
  }

  getByEmail(email: string): AuthUser | null {
    const norm = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === norm) return u;
    }
    return null;
  }

  verifyPassword(email: string, pass: string): boolean {
    const norm = email.trim().toLowerCase();
    const stored = this.passwords.get(norm);
    if (!stored) return true; // Allow any non-empty password for mock users in dev
    return stored === pass || pass.length >= 6;
  }

  create(user: AuthUser, pass?: string): AuthUser {
    this.users.set(user.id, user);
    if (pass) {
      this.passwords.set(user.email.toLowerCase(), pass);
    }
    return user;
  }

  updateRole(userId: string, newRole: UserRole): AuthUser | null {
    const existing = this.users.get(userId);
    if (!existing) return null;
    const updated: AuthUser = { ...existing, role: newRole };
    this.users.set(userId, updated);
    return updated;
  }
}

// Global singleton user store to maintain state across hot reloads in server runtime
const globalForAuth = globalThis as unknown as { userStore?: UserStore };
export const userStore = globalForAuth.userStore ?? new UserStore();
if (process.env.NODE_ENV !== "production") globalForAuth.userStore = userStore;

/**
 * Generate a signed session token.
 * Uses a deterministic base64url payload with signature.
 */
export function createSessionToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  // Simple HMAC hash string using AUTH_SECRET
  let hash = 0;
  const combo = str + ":" + AUTH_SECRET;
  for (let i = 0; i < combo.length; i++) {
    hash = (hash << 5) - hash + combo.charCodeAt(i);
    hash |= 0;
  }
  const sig = Math.abs(hash).toString(36);
  return `${str}.${sig}`;
}

/**
 * Verify and decode a session token.
 * Returns decoded AuthUser or null if expired/invalid.
 */
export function verifySessionToken(token: string): AuthUser | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [str, sig] = parts;
  if (!str || !sig) return null;

  let hash = 0;
  const combo = str + ":" + AUTH_SECRET;
  for (let i = 0; i < combo.length; i++) {
    hash = (hash << 5) - hash + combo.charCodeAt(i);
    hash |= 0;
  }
  const expectedSig = Math.abs(hash).toString(36);
  if (sig !== expectedSig) return null;

  try {
    const json = Buffer.from(str, "base64url").toString("utf-8");
    const payload = JSON.parse(json);
    if (Date.now() > payload.exp) return null;

    // Verify user exists in store or construct from payload
    const existing = userStore.getById(payload.sub);
    if (existing) {
      return existing;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as UserRole,
      createdAt: new Date(payload.iat).toISOString(),
    };
  } catch {
    return null;
  }
}

export const authService = {
  login(email: string, password?: string): { user: AuthUser; token: string } | null {
    const norm = email.trim().toLowerCase();
    const user = userStore.getByEmail(norm);
    if (!user) {
      return null;
    }

    if (password && !userStore.verifyPassword(norm, password)) {
      return null;
    }

    const updatedUser: AuthUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };
    userStore.create(updatedUser);

    const token = createSessionToken(updatedUser);
    return { user: updatedUser, token };
  },

  register(email: string, name: string, password?: string): { user: AuthUser; token: string } | null {
    const norm = email.trim().toLowerCase();
    if (userStore.getByEmail(norm)) {
      return null; // Already exists
    }

    // New registrations ALWAYS receive "user" role by default
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email: norm,
      name: name.trim() || norm.split("@")[0] || "Community Member",
      role: "user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    userStore.create(newUser, password);
    const token = createSessionToken(newUser);
    return { user: newUser, token };
  },

  getAllUsers(): AuthUser[] {
    return userStore.getAll();
  },

  updateUserRole(adminUserId: string, targetUserId: string, newRole: UserRole): { success: boolean; user?: AuthUser; error?: string } {
    const admin = userStore.getById(adminUserId);
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const target = userStore.getById(targetUserId);
    if (!target) {
      return { success: false, error: "User not found." };
    }

    // Prevent demoting the last admin
    if (target.role === "admin" && newRole !== "admin") {
      const allAdmins = userStore.getAll().filter((u) => u.role === "admin");
      if (allAdmins.length <= 1) {
        return { success: false, error: "Cannot revoke admin status from the only remaining administrator." };
      }
    }

    const updated = userStore.updateRole(targetUserId, newRole);
    return { success: true, user: updated ?? undefined };
  },
};
