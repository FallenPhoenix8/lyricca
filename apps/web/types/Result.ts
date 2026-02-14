type Ok<T> = {
  ok: true
  value: T
}
type Err<E> = {
  ok: false
  error: E
}

type Result<T, E> = Ok<T> | Err<E>

const Ok = <T>(value: T): Ok<T> => ({
  ok: true,
  value,
})
const Err = <E>(error: E): Err<E> => ({
  ok: false,
  error,
})

export type { Result }
export { Ok, Err }
