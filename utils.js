const KEYCODE = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  END: 35,
  HOME: 36,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  IS_CHAR: e => (e.which > 47 && e.which < 91) || e.which == 32
}

function findElement(collection, attribute = 'selected') {
  for (const i of collection)
    if (i.hasAttribute(attribute)) return i
  return null
}

function findIndex(collection, attribute = 'selected') {
  for (let i = 0; i < collection.length; i++)
    if (collection[i].hasAttribute(attribute)) return i
  return null
}

function findElementByContent(collection, attribute, match) {
  for (const i of collection)
    if (i[attribute] == match) return i
}

const getTemplate = qs => document.currentScript.ownerDocument.querySelector(qs)

const throttle = fn => {
  let scheduled = false
  return args => {
    if (!scheduled) {
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        fn(args)
      })
    }
  }
}
