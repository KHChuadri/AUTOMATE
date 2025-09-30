import { http } from './http'

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  error?: string
  token?: string
  user?: T
}

export async function apiPost<TResponse = unknown, TBody = unknown>(
  path: string,
  body?: TBody
): Promise<ApiResponse<TResponse>> {
  
  console.log("path", path)
  console.log("body", body)

  const { data } = await http.post<ApiResponse<TResponse>>(path, body)
  console.log("data", data)
  return data
}


