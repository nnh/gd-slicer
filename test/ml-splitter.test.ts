import { assert, expect } from "chai";
import { getMaximumLanguageIndex, splitLanguageSentences, getNewText } from "../src/ml-splitter"

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

describe("getNewText", () => {
  context("with complex text", () => {
    it("returns valid text by index 3", () => {
      const { newIndex, newIndexChanged, newText } = getNewText(1, false, "業務:|施設訪問|||監査を行い、科学性・倫理性の確認|と臨床研究の質向上のための教育|||を行う。", 3)
      assert.equal(newIndex, 1)
      assert.equal(newIndexChanged, true)
      assert.equal(newText, '業務:施設訪問監査を行い、科学性・倫理性の確認と臨床研究の質向上のための教育を行う。')
    })
    it("returns valid text by index 2", () => {
      const { newIndex, newIndexChanged, newText } = getNewText(1, false, "業務:|施設訪問|||監査を行い、科学性・倫理性の確認|と臨床研究の質向上のための教育|||を行う。", 2)
      assert.equal(newIndex, 1)
      assert.equal(newIndexChanged, true)
      assert.equal(newText, '業務:監査を行い、科学性・倫理性の確認を行う。')
    })
  })
})
