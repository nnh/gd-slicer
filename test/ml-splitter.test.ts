import { assert, expect } from "chai";
import { getMaximumLanguageIndex, splitLanguageSentences } from "../src/ml-splitter"

describe('splitLanguageSentences', () => {
  context('with ended by | string', () => {
    it('returns empty array', () => assert.deepEqual(splitLanguageSentences(' |||'), [{str: ' ', languageIndex: 3}]))
  })
  context('without ended by | string', () => {
    it('returns two elements', () => {
      assert.deepEqual(splitLanguageSentences('||| '), [{str: '', languageIndex: 3}, {str: ' ', languageIndex: undefined}])
    })
  })
  context('empty string', () => {
    it('returns empty array', () => assert.deepEqual(splitLanguageSentences(''), []))
  })
})

describe("getMaximumLanguageIndex", () => {
  context('with a single sentence', () => {
    it("returns 0 without break", () => assert.equal(getMaximumLanguageIndex('abc'), undefined))
    it("returns 1 by a single break", () => assert.equal(getMaximumLanguageIndex('abc|'), 1))
    it("returns 2 by two breaks", () => assert.equal(getMaximumLanguageIndex('abc||'), 2))
  })
  context('with two single sentences', () => {
    it("returns 1 by first single break", () => assert.equal(getMaximumLanguageIndex('abc|def'), 1))
    it("returns 2 by first two breaks", () => assert.equal(getMaximumLanguageIndex('abc||def|'), 2))
    it("returns 2 by last two breaks", () => assert.equal(getMaximumLanguageIndex('abc|def||'), 2))
  })
  context('with splitter only', () => {
    it("returns 3 by a splitter only", () => assert.equal(getMaximumLanguageIndex('|||'), 3))
    it("returns 3 by a splitter and space", () => assert.equal(getMaximumLanguageIndex('||| '), 3))
  })
})

