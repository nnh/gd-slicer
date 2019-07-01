import splitString from './split-string'
import Schema = GoogleAppsScript.Docs.Schema

enum Language {
  en,
  jp
}

function splitTextRun(elm: Schema.TextRun, open: boolean): [Schema.TextRun, boolean] {
  const [content, isOpen] = splitString(elm.content, open)
  return [{ ...elm, ...{ content: content } }, isOpen]
}

function splitParagraphElement(elm: Schema.ParagraphElement, open: boolean): [Schema.ParagraphElement | undefined, boolean] {
  if (elm.textRun) {
    const [textRun, isOpen] = splitTextRun(elm.textRun, open)
    return [{ ...elm, ...{ textRun: textRun } }, isOpen]
  } else {
    return [open ? elm : undefined, open]
  }
}

function splitParagraph(paragraph: Schema.Paragraph, open: boolean): [Schema.Paragraph | undefined, boolean] {
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
      }, [] as Schema.ParagraphElement[])
    return [{ ...paragraph, ...{ elements } }, isOpen]
  } else {
    return [open ? paragraph : undefined, open]
  }
}

function splitTableCell(tableCell: Schema.TableCell, open: boolean): [Schema.TableCell | undefined, boolean] {
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
      }, [] as Schema.StructuralElement[])
    return [{ ...tableCell, ...{ content } }, isOpen]
  } else {
    return [open ? tableCell : undefined, open]
  }
}

function splitTableRow(tableRow: Schema.TableRow, open: boolean): [Schema.TableRow | undefined, boolean] {
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
      }, [] as Schema.TableCell[])
    return [{ ...tableRow, ...{ tableCells } }, isOpen]
  } else {
    return [open ? tableRow : undefined, open]
  }
}

function splitTable(table: Schema.Table, open: boolean): [Schema.Table | undefined, boolean] {
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
    }, [] as Schema.TableRow[])
    return [{ ...table, ...{ tableRows } }, isOpen]
  } else {
    return [(open ? table : undefined), open]
  }
}

function splitTableOfContents(tableOfContents: Schema.TableOfContents, open: boolean): [Schema.TableOfContents | undefined, boolean] {
  if (tableOfContents.content instanceof Array) {
    let isOpen = open
    const content = tableOfContents.content.reduce((res, elm) => {
      const [newElm, newOpen] = splitStructuralElement(elm, isOpen)
      isOpen = newOpen
      if (newElm) {
        return res.concat(newElm)
      } else {
        return res
      }
    }, [] as Schema.StructuralElement[])
    return [{ ...tableOfContents, ...{ content } }, isOpen]
  } else {
    return [(open ? tableOfContents : undefined), open]
  }
}

function splitStructuralElement(elm: Schema.StructuralElement, open: boolean): [Schema.StructuralElement | undefined, boolean] {
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
  } else if (elm.tableOfContents) {
    if (!open) return [undefined, open]

    const [tableOfContents, isOpen] = splitTableOfContents(elm.tableOfContents, open)
    return [{ ...elm, ...{ tableOfContents } }, isOpen]
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
  if (!(Docs.Documents instanceof Object)) {
    console.log('Can not use Docs api')
    return
  }
  const doc = Docs.Documents.get(documentId)
  if (doc === undefined) {
    console.log("Can not open doc")
    return
  }
  const jpId = copyFile(documentId, 'jp')
  const jpDoc = Docs.Documents.get(jpId)
  if (jpDoc === undefined) {
    console.log("Can not copy document.")
    return
  }

  let open = true
  if (doc.body !== undefined && doc.body.content !== undefined &&
    jpDoc.body !== undefined && (jpDoc.body.content instanceof Array)) {
    const content = jpDoc.body.content

    doc.body.content.forEach((se) => {
      const [jpElement, isOpen] = splitStructuralElement(se, open)
      open = isOpen
      if (jpElement !== undefined) {
        content.push(jpElement)
      }
    })
  }
}
