async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SALT = 'void_todo_v1_';

export async function hashPin(pin: string): Promise<string> {
  return sha256(SALT + pin);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin);
  return hash === storedHash;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
