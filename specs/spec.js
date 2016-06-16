'use strict'

const demand = require('must')
const safeArrayChildReader = require('../module')

describe('function builder', () => {
  [
    `should turn "a"     into "return x['a']"`,
    `should turn "a.b"   into "return x['a'] && x['a']['b']"`,
    `should turn "a.b.c" into "return x['a'] && x['a']['b'] && x['a']['b']['c']"`,
  ].forEach(testDescription => {
    it(testDescription, () => {
      const [, desc, expectation] = testDescription.match(/should turn "(.*)"\s+into "(.*)"/)

      const funcCode = safeArrayChildReader.buildFunction(desc)
      demand(funcCode).to.equal(expectation)
    })
  })
})

describe ('child function', () => {
  it ('should access a level 1 element of array', () => {
    const testArr = [{a: 1}, {b: 2}, {c: 3}]

    demand(safeArrayChildReader.child(testArr, 'a')).must.equal(1)
    demand(safeArrayChildReader.child(testArr, 'b')).must.equal(2)
    demand(safeArrayChildReader.child(testArr, 'c')).must.equal(3)
  })

  it ('should access a level 2 element of array', () => {
    const testArr = [{a:{a: 1}}, {a:{b: 2}}, {a:{c: 3}}]

    demand(safeArrayChildReader.child(testArr, 'a.a')).must.equal(1)
    demand(safeArrayChildReader.child(testArr, 'a.b')).must.equal(2)
    demand(safeArrayChildReader.child(testArr, 'a.c')).must.equal(3)
  })

  it ('should return an object', () => {
    const testArr = [{a:{a: {obj: 1}}}, {a:{b: {obj: 2}}}, {a:{c: {obj: 3}}}]

    demand(safeArrayChildReader.child(testArr, 'a.a')).must.have.property('obj', 1)
    demand(safeArrayChildReader.child(testArr, 'a.b')).must.have.property('obj', 2)
    demand(safeArrayChildReader.child(testArr, 'a.c')).must.have.property('obj', 3)
  })
})

describe('mounting on Array.prototype', () => {
  it('must return true when mounted on Array.prototype', () => {

    demand(Array.prototype.child).must.not.exist()
    demand(safeArrayChildReader.mount()).must.be.true()
    demand(Array.prototype.child).must.exist()
    delete Array.prototype.child
  })

  it('must return false when attempting to over-mount on Array.prototype', () => {

    Array.prototype.child = () => {}
    demand(safeArrayChildReader.mount()).must.be.false()
    delete Array.prototype.child
  })
})

describe ('mounted on array', () => {
  beforeEach(() => {
    demand(safeArrayChildReader.mount()).must.be.true()
  })
  afterEach(() => {
    demand(safeArrayChildReader.unMount()).must.be.true()
  })

  it ('should access a level 1 element of array', () => {
    const testArr = [{a: 1}, {b: 2}, {c: 3}]

    demand(testArr.child('a')).must.equal(1)
    demand(testArr.child('b')).must.equal(2)
    demand(testArr.child('c')).must.equal(3)
  })

  it ('should access a level 2 element of array', () => {
    const testArr = [{a:{a: 1}}, {a:{b: 2}}, {a:{c: 3}}]

    demand(testArr.child('a.a')).must.equal(1)
    demand(testArr.child('a.b')).must.equal(2)
    demand(testArr.child('a.c')).must.equal(3)
  })

  it ('should return an object', () => {
    const testArr = [{a:{a: {obj: 1}}}, {a:{b: {obj: 2}}}, {a:{c: {obj: 3}}}]

    demand(testArr.child('a.a')).must.have.property('obj', 1)
    demand(testArr.child('a.b')).must.have.property('obj', 2)
    demand(testArr.child('a.c')).must.have.property('obj', 3)
  })
})