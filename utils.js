const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  HOME: 36,
  END: 35,
  TAB: 9,
  ENTER: 13
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
