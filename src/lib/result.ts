// Shared Result type — every async function returns { ok, data?, error? }
// Pattern copied from sysreptor/src/lib/result.ts

export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
