export class FixedBuffer<T> {
  private readonly limit: number
  private buffer: T[]

  constructor(limit: number) {
    if (limit < 1) {
      throw new Error("Limit must be greater than 0")
    }
    this.limit = limit
    this.buffer = []
  }

  push(value: T) {
    this.buffer.unshift(value)
    if (this.buffer.length > this.limit) {
      this.buffer.pop()
    }
  }

  clear() {
    this.buffer = []
  }

  includes(value: T) {
    return this.buffer.includes(value)
  }

  get value() {
    return this.buffer
  }
}
