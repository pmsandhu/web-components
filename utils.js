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
