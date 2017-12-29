const template = document.currentScript.ownerDocument.querySelector('#multiselectTemplate')

class MultiSelect extends HTMLElement {
  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))

    this.focusIndex = 0
    this.isOpen = false
    this.multiSelect = this.root.querySelector('.multiselect')
    this.tagContainer = this.root.querySelector('.tag-container')
    this.tagContainerPlaceholder = this.root.querySelector('.tag-container-placeholder')
    this.selectDropdown = this.root.querySelector('.select-dropdown')
    this.selectOptions = this.root.querySelector('.select-options')
    this.li = this.querySelectorAll('li')
    this.optionCount = this.li.length - 1
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    this.updateVisibleOptions()
    this.toggleTagContainerPlaceholder()
  }

  attachAttributes() {
    this.tagContainerPlaceholder.innerText = this.getAttribute('placeholder') || 'Select'
    this.li.forEach((val, i) => val.setAttribute('tabindex', i))
  }

  attachEventHandlers() {
    this.multiSelect.addEventListener('keydown', this.keyDownHandler.bind(this))
    this.selectOptions.addEventListener('click', e => this.selectOptionElement(e.target))
    this.tagContainer.addEventListener('click', e => this.isOpen ? this.close() : this.open())
    this.li.forEach(val => val.addEventListener('mouseenter', this.hoverHandler.bind(this)))
  }

  toggleTagContainerPlaceholder() {
    this.tagContainerPlaceholder.style.display = this.querySelectorAll('li[selected]').length ? 'none' : 'block'
  }

  updateVisibleOptions() {
    this.li.forEach(val => val.style.display = val.hasAttribute('selected') ? 'none' : 'block')
    this.focusIndex = 0
    this.setFocusedOptionElement()
    this.toggleTagContainerPlaceholder()
    this.fireChangeEvent()
  }

  open() {
    this.isOpen = true
    this.selectDropdown.style.display = 'block'
    this.setFocusedOptionElement()
  }

  close() {
    this.isOpen = false
    this.selectDropdown.style.display = 'none'
    this.tagContainer.focus()
  }

  selectOptionElement(optionElement) {
    if (!optionElement.hasAttribute('selected')) {
      optionElement.setAttribute('selected', 'selected')
      this.tagContainer.appendChild(this.createTag(optionElement))
    }
    this.updateVisibleOptions()
  }

  createTag(option) {
    const tag = document.createElement('div')
    tag.className = 'tag'

    const content = document.createElement('div')
    content.className = 'tag-text'
    content.textContent = option.textContent

    const removeButton = document.createElement('div')
    removeButton.className = 'tag-remove-button'
    removeButton.addEventListener('click', this.removeTag.bind(this, tag, option))

    tag.appendChild(content)
    tag.appendChild(removeButton)

    return tag
  }

  removeTag(tag, option, e) {
    option.removeAttribute('selected')
    tag.remove()
    this.updateVisibleOptions()
    e.stopPropagation()
  }

  keyDownHandler(e) {
    switch(e.which) {
      // BACKSPACE
      case 8:
        const tags = this.root.querySelectorAll('.tag')
        if (!tags.length) return
        const lastTag = tags[tags.length - 1]
        return this.removeTag(lastTag, this.findElement('li', 'textContent', lastTag.textContent), e)
      // ESCAPE
      case 27:
        return this.close()
      // DOWN_ARROW
      case 38:
        this.focusIndex = this.focusIndex == 0 ? this.getVisibleOptions().length - 1 : --this.focusIndex
        return this.setFocusedOptionElement()
      // UP_ARROW
      case 40:
        this.focusIndex = this.focusIndex == this.getVisibleOptions().length - 1 ? 0 : ++this.focusIndex
        return this.setFocusedOptionElement()
      // ENTER
      case 13:
        if (this.isOpen) return this.selectOptionElement(this.getVisibleOptions()[this.focusIndex])
      default:
        if (e.which > 47 && e.which < 91)
          if (!this.filterMethod(e.key, 'startsWith'))
            this.filterMethod(e.key, 'includes')
    }
  }

  filterMethod(char, method) {
    const visibleOptions = this.getVisibleOptions()

    for (let i = this.focusIndex + 1; i < visibleOptions.length; ++i)
      if (visibleOptions[i].textContent.toLowerCase()[method](char)) {
        this.focusIndex = i
        visibleOptions[this.focusIndex].focus()
        return true
      }

    for (let i = 0; i < this.focusIndex; i++)
      if (visibleOptions[i].textContent.toLowerCase()[method](char)) {
        this.focusIndex = i
        visibleOptions[this.focusIndex].focus()
        return true
      }

    return false
  }

  hoverHandler(e) {
    e.target.focus()
    let i = 0
    const visibleOptions = this.getVisibleOptions()
    while (visibleOptions[i] != e.target) ++i
    this.focusIndex = i
  }

  findElement(tagName, attribute, match) {
    for (const i of this.querySelectorAll(tagName))
      if (i[attribute] == match) return i
  }

  getVisibleOptions() {
    return this.querySelectorAll('li[style="display: block;"]')
  }

  setFocusedOptionElement() {
    const visibleOptions = this.getVisibleOptions()
    if (visibleOptions.length) visibleOptions[this.focusIndex].focus()
  }

  fireChangeEvent() {
    this.dispatchEvent(new CustomEvent('change', { detail: this.getSelectedOptions() }))
  }

  getSelectedOptions() {
    const selected = []
    this.querySelectorAll('li[selected]').forEach(val => {
      selected.push({ value: val.value, text: val.textContent })
    })
    return selected
  }

  addOneLi(val) {
    this.createLiElement(val)
    this.li = this.querySelectorAll('li')
  }

  addManyLi(array) {
    array.forEach(val => this.createLiElement(val))
    this.li = this.querySelectorAll('li')
  }

  createLiElement(val) {
    const li = document.createElement('li')
    li.value = val.value
    li.textContent = val.textContent
    li.style.display = 'block'
    li.setAttribute('tabindex', ++this.optionCount)
    this.appendChild(li)
    li.addEventListener('mouseenter', e => (e.target.focus(), this.focusIndex = this.optionCount))
  }
}

customElements.define('x-multiselect', MultiSelect)
