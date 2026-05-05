// app/lib/api.ts
export async function apiFetch(endpoint: string, options: any = {}) {
  const API_URL = "http://localhost:8000/api";

  const defaultOptions = {
    ...options,
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const res = await fetch(`${API_URL}${endpoint}`, defaultOptions);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  return res.json();
}