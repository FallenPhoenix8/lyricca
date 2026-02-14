export function trimString(str: string, character?: string): string {
  let result = str.trim()
  if (!character) {
    return result
  }

  // * MARK: - Trim character from start and end of the string
  if (str.startsWith(character)) {
    result = result.slice(1)
  }
  if (str.endsWith(character)) {
    result = result.slice(0, -1)
  }

  return result
}
