import { assert } from "chai";
import { getMaximumLanguageIndex } from "../src/ml-splitter"

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
})
