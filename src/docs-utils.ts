import Document = GoogleAppsScript.Document

export function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

export type ParentalElement = Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem
export type EachChildCallback<T> = (element: Document.Element, parent: ParentalElement) => T
export type EachElementCallback<T> = (child: Document.Element, results: T[]) => T

export function reverseChild<T>(element: Document.Element,
                             parent: ParentalElement,
                             callback: EachChildCallback<T>,
                             eachElementCallback: EachElementCallback<T>): T {
  const elementType = element.getType()
  switch (elementType) {
    case DocumentApp.ElementType.TABLE: {
      let results = [] as T[]
      for (let r = element.asTable().getNumRows() - 1; 0 <= r; --r) {
        const row = element.asTable().getRow(r)
        for (let c = row.getNumCells() - 1; 0 <= c; --c) {
          const cell = row.getCell(c)
          results.push(reverseChildren(cell, callback, eachElementCallback))
        }
      }
      return eachElementCallback(element, results)
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      return reverseChildren(element.asParagraph(), callback, eachElementCallback)
    }
    case DocumentApp.ElementType.LIST_ITEM: {
      return reverseChildren(element.asListItem(), callback, eachElementCallback)
    }
    default: {
      return callback(element, parent)
    }
  }
}

export function reverseChildren<T>(parent: ParentalElement, callback: EachChildCallback<T>, eachElementCallback: EachElementCallback<T>): T {
  let results = [] as T[]
  for (let i = parent.getNumChildren() - 1; 0 <= i; --i) {
    const child = parent.getChild(i)
    results.push(reverseChild(child, parent, callback, eachElementCallback))
  }
  return eachElementCallback(parent, results)
}
