enum Language {
  en,
  jp
}

function splitString(elm: string | undefined, open: boolean): [string | undefined, boolean] {
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
      }).join(),
      open
    ]
  } else {
    return [open ? elm : undefined, open]
  }
}

function splitTextRun(elm: GoogleAppsScript.Docs.Schema.TextRun, open: boolean): [GoogleAppsScript.Docs.Schema.TextRun, boolean] {
  const [content, isOpen] = splitString(elm.content, open)
  return [{ ...elm, ...{ content: content } }, isOpen]
}

function splitParagraphElement(elm: GoogleAppsScript.Docs.Schema.ParagraphElement, open: boolean): [GoogleAppsScript.Docs.Schema.ParagraphElement | undefined, boolean] {
  if (elm.textRun) {
    const [textRun, isOpen] = splitTextRun(elm.textRun, open)
    return [{ ...elm, ...{ textRun: textRun } }, isOpen]
  } else {
    return [open ? elm : undefined, open]
  }
}

function splitParagraph(paragraph: GoogleAppsScript.Docs.Schema.Paragraph, open: boolean): [GoogleAppsScript.Docs.Schema.Paragraph | undefined, boolean] {
  if (paragraph.elements) {
    let isOpen = open
    const elements =
      paragraph.elements.reduce((res, elm) => {
        const [newElm, newOpen] = splitParagraphElement(elm, isOpen)
        isOpen = newOpen
        if (newElm) {
          return res.concat(newElm)
        } else {
          return res
        }
      }, [])
    return [{ ...paragraph, ...{ elements } }, isOpen]
  } else {
    return [open ? paragraph : undefined, open]
  }
}

function splitTableCell(tableCell: GoogleAppsScript.Docs.Schema.TableCell, open: boolean): [GoogleAppsScript.Docs.Schema.TableCell | undefined, boolean] {
  if (tableCell.content) {
    let isOpen = open
    const content =
      tableCell.content.reduce((res, elm) => {
        const [newElm, newOpen] = splitStructuralElement(elm, isOpen)
        isOpen = newOpen
        if (newElm) {
          return res.concat(newElm)
        } else {
          return res
        }
      }, [])
    return [{ ...tableCell, ...{ content } }, isOpen]
  } else {
    return [open ? tableCell : undefined, open]
  }
}

function splitTableRow(tableRow: GoogleAppsScript.Docs.Schema.TableRow, open: boolean): [GoogleAppsScript.Docs.Schema.TableRow | undefined, boolean] {
  if (tableRow.tableCells) {
    let isOpen = open
    const tableCells =
      tableRow.tableCells.reduce((res, elm) => {
        const [newTableCell, newOpen] = splitTableCell(elm, isOpen)
        isOpen = newOpen
        if (newTableCell) {
          return res.concat(newTableCell)
        } else {
          return res
        }
      }, [])
    return [{ ...tableRow, ...{ tableCells } }, isOpen]
  } else {
    return [open ? tableRow : undefined, open]
  }
}

function splitTable(table: GoogleAppsScript.Docs.Schema.Table, open: boolean): [GoogleAppsScript.Docs.Schema.Table, boolean] {
  if (table.tableRows) {
    let isOpen = open
    const tableRows = table.tableRows.reduce((res, tableRow) => {
      const [newTableRow, newOpen] = splitTableRow(tableRow, isOpen)
      isOpen = newOpen
      if (newTableRow) {
        return res.concat(newTableRow)
      } else {
        return res
      }
    }, [])
    return [{ ...table, ...{ tableRows } }, isOpen]
  } else {
    return [(open ? table : undefined), open]
  }
}

function splitStructuralElement(elm: GoogleAppsScript.Docs.Schema.StructuralElement, open: boolean): [GoogleAppsScript.Docs.Schema.StructuralElement | undefined, boolean] {
  if (elm.paragraph) {
    const [paragraph, isOpen] = splitParagraph(elm.paragraph, open)
    if (paragraph) {
      return [{ ...elm, ...{ paragraph } }, isOpen]
    } else {
      return [open ? elm : undefined, isOpen]
    }
  } else if (elm.table) {
    if (!open) return [undefined, open]

    const [table, isOpen] = splitTable(elm.table, open)
    return [{ ...elm, ...{ table } }, isOpen]
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
    const [jpElement, isOpen] = splitStructuralElement(se, open)
    open = isOpen
    if (jpElement) {
      jpDoc.body.content.push(jpElement)
    }
  })
}
