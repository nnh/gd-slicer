export function matches(reg: RegExp, str: string) {
  let res: RegExpExecArray[]  = []
  let array: RegExpExecArray | null
  while ((array = reg.exec(str)) !== null) {
    res.push(array)
  }
  return res
}
