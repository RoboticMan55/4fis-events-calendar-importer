export type Option<T> = Some<T> | None;
export type Some<T> = { readonly some: true; readonly value: T };
export type None = { readonly some: false };

export const some = <T>(value: T): Option<T> => ({
  some: true,
  value
})

export const none = (): Option<never> => ({
  some: false
})

export const unwrapOr = <T>(option: Option<T>, fallback: T): T =>
  option.some ? option.value : fallback;