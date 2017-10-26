export const startsWith = (str: string, search: string) => {
  const searchLength = search.length
  const match = str.substr(0, searchLength)
  return search === match
}
