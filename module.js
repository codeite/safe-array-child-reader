'use strict'
const cache = {}

function buildFunction (desc) {
  const paths = desc.split('.')
    .reduce((state, bit) => {
      if (!state) {
        const root = `x['${bit}']`
        return {path:root, func:root}
      } else {
        state.path += `['${bit}']`
        state.func += ` && ${state.path}`
        return state
      }
    }, false)
  return 'return ' + paths.func
}

function child(arr, desc) {

  let matcher
  if (cache[desc]) {
    matcher = cache[desc]
  } else {
    cache[desc] = matcher = new Function(['x'], buildFunction(desc))
  }

  const match = arr.find(matcher)

  if (match) {
    return matcher(match)
  } else {
    return null
  }
}

function childOnThis(desc) {
  return child(this, desc)
}

module.exports = {
  child,
  mount (mountName) {
    mountName = mountName || 'child'
    if (Array.prototype[mountName] && Array.prototype[mountName] !== childOnThis) return false
    Array.prototype[mountName] = childOnThis
    return true
  },
  unMount (mountName) {
    mountName = mountName || 'child'
    if (Array.prototype[mountName] === childOnThis) {
      delete Array.prototype[mountName]
      return true
    } else {
      return false
    }
  },
  buildFunction
}
