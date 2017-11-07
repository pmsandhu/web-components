const ownerDocument = document.currentScript.ownerDocument
const template = ownerDocument.querySelector('#multiselectTemplate')

class MultiSelect extends HTMLElement {
  connectedCallback() {
    this.init()
    this.render()
  }
  init() {
    const root = this.createShadowRoot()
    root.appendChild(template.content.cloneNode(true))
    this.root = root

    this.options = { placeholder: this.getAttribute('placeholder') || 'Select' }
    this.control = this.root.querySelector('.multiselect')
    this.field = this.root.querySelector('.multiselect-field')
    this.popup = this.root.querySelector('.multiselect-popup')
    this.list = this.root.querySelector('.multiselect-list')
  }

  render() {
    this.attachHandlers()
    this.refreshItems()
    this.createPlaceholder()
  }

  attachHandlers() {
    this.field.addEventListener('click', this.fieldClickHandler.bind(this))
    this.list.addEventListener('click', this.listClickHandler.bind(this))
    this.control.addEventListener('keydown', this.keyDownHandler.bind(this))
  }

  fieldClickHandler() { this.isOpened ? this.close() : this.open() }

  open() {
    this.togglePopup(true)
    this.refreshFocusedItem()
  }

  close() {
    this.togglePopup(false)
    this.field.focus()
  }

  togglePopup(show) {
    this.isOpened = show
    this.popup.style.display = show ? 'block' : 'none'
    this.control.setAttribute('aria-expanded', show)
  }

  keyDownHandler(e) {
    switch(e.which) {
      case 8: //backspace
        const tags = this.root.querySelectorAll('.multiselect-tag')
        if (!tags.length) return
        const lastTag = tags[tags.length - 1]
        for (const i of this.itemElements())
          if (i.textContent === lastTag.textContent) {
            i.removeAttribute('selected')
            i.setAttribute('aria-selected', false)
            lastTag.remove()
            this.refreshItems()
            this.createPlaceholder()
          }
        break
      case 27: // escape
        return this.close()
      case 38: // down arrow
        this.focusedIdx = this.focusedIdx == 0 ? this.itemElementsDD().length - 1 : --this.focusedIdx
        return this.refreshFocusedItem()
      case 40: // up arrow
        this.focusedIdx = this.focusedIdx == this.itemElementsDD().length - 1 ? 0 : ++this.focusedIdx
        return this.refreshFocusedItem()
      case 13: // enter
        if (this.isOpened)
          return this.selectItem(this.itemElementsDD()[this.focusedIdx])
      default:
        return e.preventDefault()
    }
  }

  itemElements() { return this.querySelectorAll('li') }
  itemElementsDD() { return this.querySelectorAll('li[style="display: block;"]') }
  refreshFocusedItem() { this.itemElementsDD()[this.focusedIdx].focus() }

  listClickHandler(e) {
    let item = e.target
    while (item && item.tagName !== 'LI') item = item.parentNode
    this.selectItem(item)
  }

  selectItem(item) {
    this.removePlaceHolder()
    if (!item.hasAttribute('selected')) {
      item.setAttribute('selected', 'selected')
      item.setAttribute('aria-selected', true)
      this.fireChangeEvent()
      this.field.appendChild(this.createTag(item))
    }
    this.refreshItems()
    this.close()
  }

  refreshItems() {
    for (const i of  this.itemElements()) {
      i.setAttribute('role', 'option')
      i.setAttribute('aria-selected', i.hasAttribute('selected'))
      i.hasAttribute('selected')
        ? i.style.display = 'none'
        : i.style.display = 'block'
      i.setAttribute('tabindex', -1)
    }
    this.focusedIdx = 0
  }

  removeTag(tag, item, e) {
    item.removeAttribute('selected')
    item.setAttribute('aria-selected', false)
    for (const i of this.field.children) if (item.textContent == i.textContent) i.remove()
    this.fireChangeEvent()
    this.createPlaceholder()
    this.refreshItems()
    e.stopPropagation()

  }
  createTag(item) {
    const tag = document.createElement('div')
    tag.className = 'multiselect-tag'
    const content = document.createElement('div')
    content.className = 'multiselect-tag-text'
    content.textContent = item.textContent

    const removeButton = document.createElement('div')
    removeButton.className = 'multiselect-tag-remove-button'
    removeButton.addEventListener('click', this.removeTag.bind(this, tag, item))

    tag.appendChild(content)
    tag.appendChild(removeButton)

    return tag
  }

  createPlaceholder() {
    if (this.querySelectorAll('li[selected]').length) return
    const placeholder = document.createElement('div')
    placeholder.className = 'multiselect-field-placeholder'
    placeholder.textContent = this.options.placeholder
    this.field.appendChild(placeholder)
  }
  removePlaceHolder() {
    const placeholder = this.root.querySelector('.multiselect-field-placeholder')
    if (placeholder) placeholder.remove()
  }

  selectedItems() {
    const result = []
    const selectedItems = this.querySelectorAll('li[selected]')
    for (const i of selectedItems)
      result.push(i.hasAttribute('value') ? i.getAttribute('value') : i.textContent)
    return result
  }
  fireChangeEvent() {
    const e = new CustomEvent('change')
    this.dispatchEvent(e)
  }
  attributeChangedCallback(optionName, oldValue, newValue) {
    console.log('attributeChangedCallback')
    this.options[optionName] = newValue
    this.refreshField()
  }
}

customElements.define('x-multiselect', MultiSelect)
