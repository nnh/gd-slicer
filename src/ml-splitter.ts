// undefined: インデックス未確定
// number: インデックス確定済み
export type LanguageIndex = number | undefined
export type LanguagedString = [LanguageIndex, string]

const REG = /\A([^|]+)(|+)/;

export function splitMLString(str: string): LanguagedString[] {
  if (str.length === 0) {
    return []
  } else {
    const m = str.match(REG)
    if (m) {
      const next = str.substr(m[0].length, str.length)
      const first = [m[2].length - 1, m[1]] as LanguagedString
      return [first].concat(splitMLString(next))
    } else {
      return [[undefined, str]]
    }
  }
}

export type FixedLanguagedString = [number, string]

export function fillLanguageIndexes(strs: LanguagedString[]): FixedLanguagedString[] {
  let languageIndex = 0
  return strs.reverse().map(tuple => {
    languageIndex = tuple[0] === undefined ? languageIndex : tuple[0]
    return [languageIndex, tuple[1]] as FixedLanguagedString
  }).reverse()
}
