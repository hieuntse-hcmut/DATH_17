export function getErrorMessage(error: unknown, fallback: string): string {
  const e = error as {
    response?: { data?: { message?: string } }
    message?: string
  }
  return e?.response?.data?.message || e?.message || fallback
}