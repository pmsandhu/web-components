class MultiSelect extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(getTemplate('#multiselectTemplate').content.cloneNode(true))

    this.focusIndex = 0
    this.isOpen = false

    this.tagContainer = this.shadowRoot.querySelector('.tag-container')
    this.placeholder = this.shadowRoot.querySelector('.tag-container-placeholder')
    this.dropdown = this.shadowRoot.querySelector('.dropdown')
    this.li = this.querySelectorAll('li')
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    this.updateVisibleOptions()
    this.togglePlaceholder()
  }

  attachAttributes() {
    this.tagContainer.setAttribute('tabindex', -1)
    this.placeholder.innerText = this.getAttribute('placeholder') || 'Select'
    this.li.forEach((val, i) => val.setAttribute('tabindex', i))
    this.dropdown.hidden = true
  }

  attachEventHandlers() {
    this.addEventListener('click', this.toggle)
    this.addEventListener('keydown', this.handleKeyDown)
    this.li.forEach(val => val.addEventListener('mouseenter', this.handleMouseEnter.bind(this)))
    this.dropdown.addEventListener('click', this.selectOption.bind(this))
    document.addEventListener('click', e => this.isOpen ? this.close() : void(0))
  }

  updateVisibleOptions() {
    this.li.forEach(val => val.hidden = val.hasAttribute('selected'))
    this.focusIndex = 0
    this.setFocus()
    this.togglePlaceholder()
    this.fireChangeEvent()
  }

  togglePlaceholder() {
    this.placeholder.hidden = this.querySelectorAll('li[selected]').length
  }

  toggle(e) {
    this.isOpen ? this.close() : this.open()
    e.stopPropagation()
  }

  open() {
    this.isOpen = true
    this.dropdown.hidden = false
    this.setFocus()
  }

  close() {
    this.isOpen = false
    this.dropdown.hidden = true
    this.tagContainer.focus()
  }

  selectOption(e) {
    if (!e.target.hasAttribute('selected')) {
      e.target.setAttribute('selected', '')
      this.tagContainer.appendChild(this.createTag(e.target))
    }
    this.updateVisibleOptions()
    e.stopPropagation()
  }

  getVisibleOptions() {
    return this.querySelectorAll('li:not([hidden]')
  }

  setFocus() {
    const visibleOptions = this.getVisibleOptions()
    if (visibleOptions.length) visibleOptions[this.focusIndex].focus()
  }

  handleMouseEnter(e) {
    e.target.focus()
    let i = 0
    const visibleOptions = this.getVisibleOptions()
    while (visibleOptions[i] != e.target) ++i
    this.focusIndex = i
  }

  handleKeyDown(e) {
    switch(e.which) {

      case KEYCODE.BACKSPACE:
        const tags = this.shadowRoot.querySelectorAll('.tag')
        if (!tags.length) return
        const lastTag = tags[tags.length - 1]
        this.removeTag(lastTag, findElementByContent(this.li, 'textContent', lastTag.textContent), e)
        break

      case KEYCODE.ESCAPE:
        this.close()
        break

      case KEYCODE.UP:
        const length = this.getVisibleOptions().length
        this.focusIndex = (this.focusIndex - 1 + length) % length
        this.setFocus()
        break

      case KEYCODE.DOWN:
        if (!this.isOpen) return this.open()
        this.focusIndex = (this.focusIndex + 1) % this.getVisibleOptions().length
        this.setFocus()
        break

      case KEYCODE.ENTER:
        if (this.isOpen) {
          this.selectOption(e)
        }
        break

      default:
        if (e.which > 47 && e.which < 91)
          if (!this.filterMethod(e.key, 'startsWith'))
            this.filterMethod(e.key, 'includes')
        break
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
    array.forEach((val, i) => this.createLiElement(val, this.li.length + i))
    this.li = this.querySelectorAll('li')
  }

  createLiElement(val, i = 0) {
    const li = document.createElement('li')
    for (let prop in val) li[prop] = val[prop]
    li.setAttribute('tabindex', i)
    li.addEventListener('mouseenter', this.handleMouseEnter.bind(this))
    this.appendChild(li)
  }
}

customElements.define('x-multiselect', MultiSelect)
