
export async function login(email: string, password: string): Promise<boolean> {
  const response = await fetch("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.ok;
}

export async function logout(): Promise<void> {
  await fetch("/api/admin/session", { method: "DELETE" });
}

export async function isLoggedIn(): Promise<boolean> {
  const response = await fetch("/api/admin/session", { cache: "no-store" });
  if (!response.ok) return false;
  const data = await response.json();
  return data.authenticated === true;
}
