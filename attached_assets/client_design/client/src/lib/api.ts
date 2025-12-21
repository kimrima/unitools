import type { User } from "@shared/schema";

// Auth API
export async function register(username: string, password: string, email?: string): Promise<{ user: User }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  
  return res.json();
}

export async function login(username: string, password: string): Promise<{ user: User }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function getCurrentUser(): Promise<{ user: User | null }> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });
  
  if (!res.ok) {
    return { user: null };
  }
  
  return res.json();
}

// Subscription API
export async function upgradeToPremium(durationMonths: number = 1): Promise<{ user: User }> {
  const res = await fetch("/api/subscription/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ durationMonths }),
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Upgrade failed");
  }
  
  return res.json();
}

export async function cancelPremium(): Promise<{ user: User }> {
  const res = await fetch("/api/subscription/cancel", {
    method: "POST",
    credentials: "include",
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Cancellation failed");
  }
  
  return res.json();
}

// File History API
export async function saveFileHistory(data: {
  toolId: string;
  toolName: string;
  fileName?: string;
  fileSize?: number;
  processingTime?: number;
  status?: string;
}): Promise<void> {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
}

export async function getFileHistory(limit: number = 50) {
  const res = await fetch(`/api/history?limit=${limit}`, {
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }
  
  return res.json();
}

export async function getHistoryStats() {
  const res = await fetch("/api/history/stats", {
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  
  return res.json();
}
