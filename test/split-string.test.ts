import { assert } from "chai";
import splitString from "../src/split-string";

describe("splitString", () => {
  context('opened', () => {
    it("sprits closed string", () => {
      const [res, isOpen] = splitString('hello|world|', true)
      assert.equal(res, 'hello')
      assert.equal(isOpen, true)
    })
    it("sprits opened string", () => {
      const [res, isOpen] = splitString('hello|world', true)
      assert.equal(res, 'hello')
      assert.equal(isOpen, false)
    })
  })
  context('closed', () => {
    it("sprits closed string", () => {
      const [res, isOpen] = splitString('hello|world|', false)
      assert.equal(res, 'world')
      assert.equal(isOpen, false)
    })
    it("sprits opened string", () => {
      const [res, isOpen] = splitString('hello|world', false)
      assert.equal(res, 'world')
      assert.equal(isOpen, true)
    })
  })
})

