import '../Autofill/Autofill.js'

const multiSelectTemplate = document.createElement('template')
multiSelectTemplate.innerHTML = `
<link rel="stylesheet" href="./MultiSelect.css">
<link rel="stylesheet" href="/__icons/fabric-icons.css">


<div class="multiselect">

  <div class="container">
    <x-autofill></x-autofill>
  </div>

  <div class="dropdown">
    <ul class="options">
      <slot></slot>
    </ul>
    <span class="no-results" style="display: none;">No results found.</span>
  </div>

</div>
`
class MultiSelect extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(multiSelectTemplate.content.cloneNode(true))

    this.focusIndex = 0
    this.tagFocusIndex = 0
    this.preventInputFocusToggle = false
    this.previousValue = ''

    this.isOpen = false

    this.container = this.shadowRoot.querySelector('.container')
    this.input = this.shadowRoot.querySelector('x-autofill')
    console.log(this.input)
    this.placeholder = this.getAttribute('placeholder') || 'Select'

    this.tags = this.shadowRoot.querySelectorAll('.tag')

    this.dropdown = this.shadowRoot.querySelector('.dropdown')
    this.ul = this.shadowRoot.querySelector('ul')
    this.li = this.querySelectorAll('li')
    this.noResults = this.shadowRoot.querySelector('.no-results')

    this.filter = this.filter.bind(this)

    this.handleMouseMove = throttle(this.handleMouseMove)
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    this.updateVisibleOptions()
  }

  attachAttributes() {
    this.input.registerFilterCallback(this.filter)
    this.addElements(this.li, true)

    this.container.setAttribute('tabindex', -1)
    this.dropdown.hidden = true
  }

  attachEventHandlers() {
    this.addEventListener('keydown', this.rootKeyDown)
    this.addEventListener('keyup', this.rootKeyUp.bind(this))
    this.input.addEventListener('focus', this.toggle)
    this.input.addEventListener('enter-keypress', this.onEnterKeyPress)
    this.input.addEventListener('backspace-keypress', this.onBackspaceOrLeftArrowKey)
    this.input.addEventListener('left-arrow-keypress', this.onBackspaceOrLeftArrowKey)

    this.ul.addEventListener('mousemove', this.handleMouseMove)
    this.dropdown.addEventListener('click', this.selectOptionFromDropdown)

    document.addEventListener('click', e => {
      if (!this.contains(e.target) && this.isOpen) {
        this.close()
        this.input.value = ''
      }
    })
  }

  updateVisibleOptions() {
    this.li.forEach(val => val.hidden = val.hasAttribute('selected'))

    this.tags = this.shadowRoot.querySelectorAll('.tag')
    this.tagFocusIndex = this.tags.length

    this.focusIndex = 0
    this.setFocus()

    this.input.placeholder = this.querySelectorAll('li[selected]').length ? '' : this.placeholder
    this.dispatchEvent(new CustomEvent('change', { detail: this.getSelectedOptions() }))
  }

  open() {
    this.isOpen = true
    this.dropdown.hidden = false
    this.setFocus()
  }

  close() {
    this.isOpen = false
    this.dropdown.hidden = true
    this.container.focus()
  }

  toggle = e => {
    if (this.preventInputFocusToggle) return this.preventInputFocusToggle = false

    this.isOpen ? this.close() : this.open()
    e.stopPropagation()
  }

  setFocus() {
    const visibleOptions = this.getNotFilteredOptions()
    visibleOptions.forEach((val, i) => val.classList.toggle('focused', i === this.focusIndex))
  }

  getVisibleOptions() {
    return this.querySelectorAll('li:not([hidden]')
  }

  getNotFilteredOptions(array = false) {
    const notFiltered = this.querySelectorAll('li:not([hidden]):not(.filtered)')
    return array ? Array.from(notFiltered) : notFiltered
  }

  removeFilter() {
    this.li.forEach(val => val.classList.toggle('filtered', false))
  }

  selectOption(node) {
    if (!node.hasAttribute('selected')) {
      node.setAttribute('selected', '')
      this.container.insertBefore(this.createTag(node), this.input)
    }
    this.updateVisibleOptions()
  }

  selectOptionFromDropdown = e => {
    this.preventInputFocusToggle = true
    this.selectOption(e.target)
    this.input.value = ''
    this.removeFilter()
    this.input.focus()
  }

  handleMouseMove = e => {
    const i = this.getNotFilteredOptions(true).findIndex(val => val == e.target)
    if (!i) return
    this.focusIndex = i
    this.setFocus()
  }

  onEnterKeyPress = ({ detail: { event } }) => {
    const li = this.getNotFilteredOptions()[this.focusIndex]
    if (li && li.textContent.includes(event.target.value)) this.selectOption(li)
    this.removeFilter()
    this.setFocus()
  }

  onBackspaceOrLeftArrowKey = ({ detail: { event } }) => {
    if (!this.tags.length) return
    this.tagFocusIndex = this.tags.length - 1
    this.tags[this.tagFocusIndex].focus()
    if (event.which === KEYCODE.BACKSPACE) this.tagFocusIndex = this.tags.length
  }

  rootKeyUp = e => {
    if (!this.tags.length) return

    switch(e.which) {
      case KEYCODE.LEFT:
        --this.tagFocusIndex

        if (this.tagFocusIndex == -1) this.tagFocusIndex = 0
        this.tags[this.tagFocusIndex].focus()
        break

      case KEYCODE.RIGHT:
        ++this.tagFocusIndex

        if (this.tagFocusIndex >= this.tags.length) {
          --this.tagFocusIndex
          this.preventInputFocusToggle = true
          this.input.focus()
          break
        }

        this.tags[this.tagFocusIndex].focus()
        break

      case KEYCODE.BACKSPACE:
        if (this.tags.length == this.tagFocusIndex) return this.tagFocusIndex = this.tags.length - 1

        const tag = this.tags[this.tagFocusIndex]
        if (!tag) break

        // this.container.insertBefore(this.input, tag)
        this.removeTag(tag, findElementByContent(this.li, 'textContent', tag.textContent), e)
        --this.tagFocusIndex

        this.preventInputFocusToggle = true
        this.input.focus()
        break

      default:
        break
    }
  }

  rootKeyDown = e => {
    switch(e.which) {
      case KEYCODE.ESCAPE:
        this.close()
        break

      case KEYCODE.UP:
        e.preventDefault()
        const length = this.getNotFilteredOptions().length
        this.setInput((this.focusIndex - 1 + length) % length)
        break

      case KEYCODE.DOWN:
        e.preventDefault()
        if (!this.isOpen) return this.open()
        this.setInput((this.focusIndex + 1) % this.getNotFilteredOptions().length)
        break

      default:
        break
    }
  }

  setInput(newFocusIndex) {
    const notFilterOptions = this.getNotFilteredOptions()
    if (!notFilterOptions.length) return
    notFilterOptions[this.focusIndex].classList.remove('focused')
    this.focusIndex = newFocusIndex

    const node = notFilterOptions[this.focusIndex]
    node.classList.add('focused')
    node.scrollIntoViewIfNeeded()
    this.input.setRange(node.textContent, this.previousValue.length, node.textContent.length)
  }

  filter(value) {
    let filtered = null
    let focusIndex = -1

    this.getVisibleOptions().forEach((node, i) =>
      node.classList.toggle('filtered', !node.textContent.toLowerCase().startsWith(value)))

    for (let [i, node] of this.getNotFilteredOptions().entries()) {
      if (node.textContent.toLowerCase().startsWith(value)) {
        filtered = node.textContent
        focusIndex = i
        break
      }
    }

    this.noResults.style.display = filtered ? 'none' : 'block'
    this.focusIndex = focusIndex
    this.setFocus()
    return filtered
  }

  createTag(option) {
    const tag = document.createElement('div')
    tag.className = 'tag'
    tag.setAttribute('tabindex', -1)

    const content = document.createElement('div')
    content.className = 'text'
    content.textContent = option.textContent

    tag.appendChild(content)

    const removeButton = document.createElement('div')
    removeButton.className = 'remove-icon'
    removeButton.addEventListener('click', this.removeTag.bind(this, tag, option))

    const cancel = document.createElement('i')
    cancel.setAttribute('name', 'Cancel')
    removeButton.appendChild(cancel)

    tag.appendChild(removeButton)

    return tag
  }

  removeTag(tag, option, e) {
    option.removeAttribute('selected')
    tag.remove()
    this.updateVisibleOptions()
    e.stopPropagation()
  }

  addElements(array, isNodeList = false) {
    array.forEach((val, i) => this.createLiElement(val, this.li.length + i, isNodeList))
    this.li = this.querySelectorAll('li')
    this.tags = this.shadowRoot.querySelectorAll('.tag')
  }

  createLiElement(val, i = 0, isNode) {
    let li = isNode ? val : document.createElement('li')
    li.setAttribute('tabindex', i)

    if (!isNode) {
      for (let prop in val) if (val[prop]) li[prop] = val[prop]
      this.appendChild(li)
    }

    if (li.hasAttribute('selected')) {
      li.setAttribute('selected', '')
      li.setAttribute('hidden', true)
      this.container.insertBefore(this.createTag(li), this.input)
    }
  }

  getSelectedOptions() {
    const selected = []
    this.querySelectorAll('li[selected]').forEach(val => {
      selected.push({ value: val.value, text: val.textContent, selected: true })
    })
    return selected
  }
}

customElements.define('x-multiselect', MultiSelect)

