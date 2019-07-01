export default function splitString(elm: string, open: boolean): [string, boolean] {
  return [
    elm.split('').map((char: string) => {
      if (char === '|') {
        open = !open
        return ''
      } else if (open) {
        return char
      } else {
        return ''
      }
    }).join(''),
    open
  ]
}
