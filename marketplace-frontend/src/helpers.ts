export function normalizeSpace(space : string): string {
  space = space.startsWith('@') ? space.substring(1) : space;
  return space.toLocaleLowerCase()
}
