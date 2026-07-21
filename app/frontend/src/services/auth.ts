const TOKEN_KEY = 'little-blog-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function fetchPublicKey(): Promise<CryptoKey> {
  const res = await fetch('/api/auth/public-key');
  const data = await res.json();
  const pem = data.public_key;
  const binary = Uint8Array.from(atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')), c => c.charCodeAt(0));
  return crypto.subtle.importKey('spki', binary, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
}

export async function login(password: string): Promise<boolean> {
  const publicKey = await fetchPublicKey();
  const encoded = new TextEncoder().encode(password);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: b64 }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  setToken(data.token);
  return true;
}

export function logout() {
  clearToken();
  window.location.hash = '#/';
  window.location.reload();
}
