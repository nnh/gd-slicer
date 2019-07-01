export default function splitString(elm: string | undefined, open: boolean): [string | undefined, boolean] {
  if (elm) {
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
  } else {
    return [open ? elm : undefined, open]
  }
}
