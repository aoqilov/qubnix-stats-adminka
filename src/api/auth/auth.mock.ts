import { MockApiError, mockDelay } from "@/api-config/mock";
import type { AdminUser, LoginRequest, LoginResponse } from "@/api/auth/auth.types";

interface MockAccount extends AdminUser {
  password: string;
}

/** Demo akkauntlar — login ekranida ham ko'rsatiladi (`MOCK_LOGIN_HINTS`). */
const ACCOUNTS: MockAccount[] = [
  { id: 1, login: "admin", password: "admin123", fullName: "Aziz Karimov", role: "admin" },
  { id: 2, login: "marketing", password: "marketing123", fullName: "Dilnoza Rahimova", role: "marketing" },
  { id: 3, login: "analyst", password: "analyst123", fullName: "Jasur Tursunov", role: "analyst" },
];

export const MOCK_LOGIN_HINTS = ACCOUNTS.map(({ login, password }) => ({ login, password }));

const TOKEN_PREFIX = "mock-admin";

function toAdminUser({ password: _password, ...admin }: MockAccount): AdminUser {
  return admin;
}

function accountByToken(token: string | null): MockAccount | undefined {
  const [prefix, id] = token?.split(".") ?? [];
  if (prefix !== TOKEN_PREFIX) return undefined;
  return ACCOUNTS.find((account) => String(account.id) === id);
}

export const authMock = {
  async login({ login, password }: LoginRequest): Promise<LoginResponse> {
    await mockDelay();
    const account = ACCOUNTS.find(
      (item) => item.login === login.trim().toLowerCase() && item.password === password,
    );
    if (!account) throw new MockApiError(401, "invalid_credentials");
    return {
      token: `${TOKEN_PREFIX}.${account.id}.${Date.now()}`,
      admin: toAdminUser(account),
    };
  },

  async me(token: string | null): Promise<AdminUser> {
    await mockDelay();
    const account = accountByToken(token);
    if (!account) throw new MockApiError(401, "unauthorized");
    return toAdminUser(account);
  },

  async logout(): Promise<void> {
    await mockDelay();
  },
};
