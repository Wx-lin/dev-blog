const TOKEN_KEY = 'blog-admin-token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}
