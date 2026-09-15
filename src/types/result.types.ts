export type Result<T, E> = Ok<T> | Err<E>;
export type Ok<T> = { readonly ok: true, readonly value: T }
export type Err<E> = { readonly ok: false, readonly error: E }

export function ok(): Result<void, never>;
export function ok<T>(value: T): Result<T, never>;

export function ok<T>(value?: T): Result<T | void, never> {
  return { ok: true, value: value as T};  
}

export const err = <E>(error: E): Result<never, E> =>
  ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => 
  result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok