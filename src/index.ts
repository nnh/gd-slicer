enum Language {
  en,
  jp
}

function splitString(elm: string, lang: Language, open: boolean): [string, boolean] {
  return [
    Array.from(elm).map(char => {
      if (char === '|') {
        open = !open
        return ''
      } else if (open) {
        return char
      } else {
        return ''
      }
    })
    open
  ]
}

function splitTextRun(elm: GoogleAppsScript.Docs.Schema.TextRun, lang: Language, open: boolean): [GoogleAppsScript.Docs.Schema.TextRun, boolean] {
  const content, isOpen = splitString(elm.content.lang, open)
  return [{ ...elm, ...{ content: content } }, isOpen]
}

function splitParagraph(elm: GoogleAppsScript.Docs.Schema.ParagraphElement, lang: Language, open: boolean): [GoogleAppsScript.Docs.Schema.ParagraphElement | undefined, boolean] {
  if (elm.textRun) {
    const textRun, isOpen = splitTextRun(elm, lang, open)
    return [{ ...elm, ...{ textRun: textRun } }, isOpen]
  } else {
    return [open ? elm : undefined, open]
  }
}

function splitTableRows(tableRows: Array<GoogleAppsScript.Docs.Schema.TableRow>, lang: Language): Array<GoogleAppsScript.Docs.Schema.TableRow> {
}

function splitStructuralElement(elm: GoogleAppsScript.Docs.Schema.StructuralElement, lang: Language, open: boolean): [GoogleAppsScript.Docs.Schema.StructuralElement | undefined, boolean] {
  if (elm.paragraph) {
    const elements = se.paragraph.elements.reduce((arr, e) => {
      const newElm, isOpen = splitParagraph(e, lang, open)
      open = isOpen
      return arr + (newElm ? [newElm] : [])
    }, [])
    const paragraph = { ...elm.paragraph, ...{ elements } }
    return [{ ...se, ...{ paragraph } }, open]
  } else if (se.table) {
    if (!open) return [undefined, open]

    const tableRows = splitTableRows(elm.table.tableRows, lang)
    const table = { ...elm.table, ...{ tableRows } }
    return [{ ...se, ...{ table } }, open]
  } else {
    return [(open ? elm : undefined), open]
  }
}

function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

function main() {
  const documentId = "1CVzQfBa6L9-ZSm7E9WVzlwY9jGmljl1sRTfaiYFGqNU"
  const doc = Docs.Documents.get(documentId)
  const jpId = copyFile(documentId, 'jp')
  const jpDoc = Docs.Documents.get(jpId)
  jpDoc.body.content = []

  let open = false
  doc.body.content.forEach((se) => {
    const jpElement, isOpen = splitStructuralElement(se, Language.jp, open)
    open = isOpen
    if (jpElement) {
      jpDoc.body.content.push(jpElement)
    }
  })
}
