const ownerDocument = document.currentScript.ownerDocument
const template = ownerDocument.querySelector('#multiselectTemplate')

class MultiSelect extends HTMLElement {
  constructor() {
    super()
  }

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
    this.refreshField()
    this.refreshItems()
  }

  open() {
    this.togglePopup(true)
    this.refreshFocusedItem()
  }

  close() {
    this.togglePopup(false)
    this.field.focus()
  }

  attachHandlers() {
    this.field.addEventListener('click', this.fieldClickHandler.bind(this))
    this.list.addEventListener('click', this.listClickHandler.bind(this))
    this.control.addEventListener('keydown', this.keyDownHandler.bind(this))
  }

  fieldClickHandler() { this.isOpened ? this.close() : this.open() }
  listClickHandler(e) {
    let item = e.target
    while (item && item.tagName !== 'LI') {
      item = item.parentNode
      console.log(item)
    }
    this.selectItem(item)
  }

  keyDownHandler(e) {
    switch(e.which) {
      case 8: return this.handleBackspaceKey()
      case 13: return this.handleEnterKey()
      case 27: return this.close() // escape
      case 38: return this.handleArrowUpKey()
      case 40: return this.handleArrowDownKey()
      default: return e.preventDefault()
    }
  }

  handleEnterKey() {
    if (this.isOpened)
      this.selectItem(this.itemElements()[this.focusedItemIndex])
  }

  handleBackspaceKey() {
    const selectedItemElements = this.querySelectorAll('li[selected]')
    if (selectedItemElements.length) this.unselectItem(selectedItemElements[selectedItemElements.length - 1])
  }

  handleArrowDownKey() {
    this.focusedItemIndex = this.focusedItemIndex < this.itemElements().length - 1
      ? this.focusedItemIndex + 1
      : 0
    this.refreshFocusedItem()
  }

  handleArrowUpKey() {
    this.focusedItemIndex = this.focusedItemIndex > 0
      ? this.focusedItemIndex - 1
      : this.itemElements().length - 1
    this.refreshFocusedItem()
  }

  fireChangeEvent() {
    const e = new CustomEvent('change')
    this.dispatchEvent(e)
  }

  togglePopup(show) {
    this.isOpened = show
    this.popup.style.display = show ? 'block' : 'none'
    this.control.setAttribute('aria-expanded', show)
  }

  selectItem(item) {
    if (!item.hasAttribute('selected')) {
      item.setAttribute('selected', 'selected')
      item.setAttribute('aria-selected', true)
      this.fireChangeEvent()
      this.refreshField()
    }
    this.close()
  }

  selectedItems() {
    const result = []
    const selectedItems = this.querySelectorAll('li[selected]')
    for (const i of selectedItems)
      result.push(i.hasAttribute('value') ? i.getAttribute('value') : i.textContent)
    return result
  }

  refreshFocusedItem() { this.itemElements()[this.focusedItemIndex].focus() }
  itemElements() { return this.querySelectorAll('li') }

  createPlaceholder() {
    const placeholder = document.createElement('div')
    placeholder.className = 'multiselect-field-placeholder'
    placeholder.textContent = this.options.placeholder
    return placeholder
  }

  refreshField() {
    this.field.innerHTML = ''
    const selectedItems = this.querySelectorAll('li[selected]')
    if (!selectedItems.length) return this.field.appendChild(this.createPlaceholder())
    for (const i of selectedItems)
      this.field.appendChild(this.createTag(i))

  }

  refreshItems() {
    const itemElements = this.itemElements()
    for (const i of itemElements) {
      i.setAttribute('role', 'option')
      i.setAttribute('aria-selected', i.hasAttribute('selected'))
      i.setAttribute('tabindex', -1)
    }
    this.focusedItemIndex = 0
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

  removeTag(tag, item, event) {
    this.unselectItem(item)
    event.stopPropagation()
  }

  unselectItem(item) {
    item.removeAttribute('selected')
    item.setAttribute('aria-selected', false)
    this.fireChangeEvent()
    this.refreshField()
  }

  attributeChangedCallback(optionName, oldValue, newValue) {
    this.options[optionName] = newValue
    this.refreshField()
  }
}

customElements.define('x-multiselect', MultiSelect)
