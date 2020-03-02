import { expect } from "chai";
import { matches } from '../src/string-utils'

describe("matches", () => {
  context('mutiple matches', () => {
    it('returns spletted chars', () => expect(matches(/[a-z]/g, 'abc').map(m => m[0])).to.eql(['a', 'b', 'c']))
  })
  context('with no end marked string', () => {
    it('returns spletted sentences', () => {
      expect(matches(/([^|]+$|[^|]*(\|+))/g, '||| ').map(m => m[0])).to.eql(['|||', ' '])
    })
  })
  context('with | ended string', () => {  
    it('returns spletted sentences', () => {
      expect(matches(/([^|]+$|[^|]*(\|+))/g, ' |||').map(m => m[0])).to.eql([' |||'])
    })
  })
})
