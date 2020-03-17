import Document = GoogleAppsScript.Document

export function copyFile(fromId: string, newFileName: string) {
  const org = DriveApp.getFileById(fromId);
  const newFile = org.makeCopy(newFileName);
  return newFile.getId()
}

export type ParentalElement = Document.Body | Document.TableCell | Document.Paragraph | Document.ListItem
export type EachChildCallback<T> = (element: Document.Element, parent: ParentalElement) => T
export type AfterChildrenCallback<T> = (child: Document.Element, results: T[]) => T

export function reverseChild<T>(element: Document.Element,
                             parent: ParentalElement,
                             eachChildCallback: EachChildCallback<T>,
                             afterChildrenCallback: AfterChildrenCallback<T>): T {
  const elementType = element.getType()
  switch (elementType) {
    case DocumentApp.ElementType.TABLE: {
      let results = [] as T[]
      for (let r = element.asTable().getNumRows() - 1; 0 <= r; --r) {
        const row = element.asTable().getRow(r)
        for (let c = row.getNumCells() - 1; 0 <= c; --c) {
          const cell = row.getCell(c)
          results.push(reverseChildren(cell, eachChildCallback, afterChildrenCallback))
        }
      }
      return afterChildrenCallback(element, results)
    }
    case DocumentApp.ElementType.PARAGRAPH: {
      return reverseChildren(element.asParagraph(), eachChildCallback, afterChildrenCallback)
    }
    case DocumentApp.ElementType.LIST_ITEM: {
      return reverseChildren(element.asListItem(), eachChildCallback, afterChildrenCallback)
    }
    default: {
      return eachChildCallback(element, parent)
    }
  }
}

export function reverseChildren<T>(parent: ParentalElement, eachChildCallback: EachChildCallback<T>, afterChildrenCallback: AfterChildrenCallback<T>): T {
  let results = [] as T[]
  for (let i = parent.getNumChildren() - 1; 0 <= i; --i) {
    const child = parent.getChild(i)
    results.push(reverseChild(child, parent, eachChildCallback, afterChildrenCallback))
  }
  return afterChildrenCallback(parent, results)
}
