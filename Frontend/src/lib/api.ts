import { http } from "./http";

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: T;
  diagrams?: T;
  diagram?: T;
}

export interface Diagram {
  id: string;
  title: string;
  created_at: string;
  last_edited: string;
}

// Note: Prefer returning strongly typed shapes from helpers rather than mirroring raw API
// responses everywhere. For diagrams list, we expose `{ diagrams: Diagram[] }`.

export async function apiPost<TResponse = unknown, TBody = unknown>(
  path: string,
  body?: TBody
): Promise<ApiResponse<TResponse>> {
  console.log(path, "path");
  console.log(body, "body");
  const { data } = await http.post<ApiResponse<TResponse>>(path, body);

  console.log("Data", data);
  return data;
}

export async function fetchUserDiagrams(userId: string): Promise<{ diagrams: Diagram[] }> {
  const { data } = await http.post<ApiResponse<Diagram[]>>("/diagram/fetch-all", {
    userId,
  });
  return { diagrams: data.diagrams ?? [] };
}
