import Document = GoogleAppsScript.Document

export function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

export type ParentalElement = Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem
export type EachChildCallback = (element: Document.Element) => boolean

export function reverseChild(element: Document.Element, callback: EachChildCallback) {
  const elementType = element.getType()
  switch (elementType) {
    case DocumentApp.ElementType.TABLE: {
      for (let r = element.asTable().getNumRows() - 1; 0 <= r; --r) {
        const row = element.asTable().getRow(r)
        for (let c = row.getNumCells() - 1; 0 <= c; --c) {
          const cell = row.getCell(c)
          reverseChildren(cell, callback)
        }
      }
      return false
    }
    case DocumentApp.ElementType.LIST_ITEM: {
      return reverseChildren(element.asListItem(), callback)
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      return reverseChildren(element.asParagraph(), callback)
    }
    default: {
      return callback(element)
    }
  }
}

export function reverseChildren(parent: ParentalElement, callback: EachChildCallback): boolean {
  for (let i = parent.getNumChildren() - 1; 0 <= i; --i) {
    const child = parent.getChild(i)
    const remove = reverseChild(child, callback)
    if (remove) {
      parent.removeChild(child)
    }
  }
  return false
}
