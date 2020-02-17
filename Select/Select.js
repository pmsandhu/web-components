const selectTemplate = document.createElement('template')

selectTemplate.innerHTML = `
<link rel="stylesheet" href="./Select.css">

<div class="select">
  <div class="container">
    <div>
      <span id="value" class="placeholder"></span>
      <svg class="close_icon" width="9" height="9" viewBox="-1 -1 11 11">
        <path d="M9 0 L 0 9 M9 9 L 0 0"/>
      </svg>
      <svg class="arrow_icon" width="10" height="6" viewBox="0 0 10 6">
        <path d="M5 6 L 0 0 H 10 Z"/>
      </svg>
    </div>
  </div>

  <div class="dropdown">
    <ul class="options">
      <slot></slot>
    </ul>
  </div>

</div>
`

class Select extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(selectTemplate.content.cloneNode(true))
    this.focusIndex = 0
    this.isOpen = false

    this.container = this.shadowRoot.querySelector('.container')
    this.value = this.shadowRoot.querySelector('.placeholder')
    this.dropdown = this.shadowRoot.querySelector('.dropdown')

    this.close_icon = this.shadowRoot.querySelector('.close_icon')
    this.arrow_icon = this.shadowRoot.querySelector('.arrow_icon  > path')

    this.li = this.querySelectorAll('li')
    this.defaultValue = {
      textContent: this.getAttribute('placeholder') || 'Select ...',
      className: 'placeholder'
    }
  }

  connectedCallback() {
    this.setupAttributesAndEventHandlers()
    this.setUpSlotDefinedDefaults()
  }

  setupAttributesAndEventHandlers() {
    this.container.setAttribute('tabindex', -1)
    this.dropdown.hidden = true
    this.li.forEach((val, i) => {
      val.setAttribute('tabindex', i)
      val.addEventListener('mouseenter', this.handleMouseEnter.bind(this, i))
    })

    this.addEventListener('click', this.toggle)
    this.addEventListener('keydown', this.handleKeyPress)
    this.dropdown.addEventListener('click', this.selectValue.bind(this))
    this.close_icon.addEventListener('click', this.deselectValue.bind(this))
    document.addEventListener('click', e => this.isOpen ? this.close() : void (0))

  }

  setUpSlotDefinedDefaults() {
    const hasDefaultSelection = this.querySelector('li[selected]')
    if (!hasDefaultSelection) return this.updateValue(this.defaultValue)
    this.focusIndex = hasDefaultSelection.tabIndex
    this.selectValue()
  }

  updateValue({ textContent, className }) {
    this.close_icon.style.display = className == 'placeholder' ? 'none' : 'block'
    this.value.textContent = textContent
    this.value.className = className
  }

  setFocus() {
    this.li[this.focusIndex].focus()
  }

  open() {
    this.isOpen = true
    this.arrow_icon.setAttribute('transform', 'rotate(180, 5, 3)')
    this.dropdown.hidden = false
    this.setFocus()
  }

  close() {
    this.isOpen = false
    this.arrow_icon.removeAttribute('transform')
    this.dropdown.hidden = true
    this.container.focus()
  }

  toggle(e) {
    this.isOpen ? this.close() : this.open()
    e.stopPropagation()
  }

  handleKeyPress(e) {
    switch(e.which) {

      case KEYCODE.BACKSPACE:
        this.deselectValue(e)
        break

      case KEYCODE.ESCAPE:
        this.close()
        break

      case KEYCODE.UP:
        this.focusIndex = (this.focusIndex - 1 + this.li.length) % this.li.length
        this.setFocus()
        break

      case KEYCODE.DOWN:
        if (!this.isOpen) return this.open()
        this.focusIndex = (this.focusIndex + 1) % this.li.length
        this.setFocus()
        break

      case KEYCODE.ENTER:
        if (this.isOpen) this.selectValue(e)
        else this.open()
        break

      default:
        if (e.which > 47 && e.which < 91)
          if (!this.filterMethod(e.key, 'startsWith'))
            this.filterMethod(e.key, 'includes')
        break
    }
  }

  filterMethod(char, method) {
    for (let i = this.focusIndex + 1; i < this.li.length; ++i) {
      if (this.li[i].textContent.toLowerCase()[method](char)) {
        this.focusIndex = i
        this.setFocus()
        return true
      }
    }
    for (let i = 0; i < this.focusIndex; i++) {
      if (this.li[i].textContent.toLowerCase()[method](char)) {
        this.focusIndex = i
        this.setFocus()
        return true
      }
    }
    return false
  }

  selectValue(e) {
    const currentSelected = this.querySelector('li[selected]')
    if (currentSelected) currentSelected.removeAttribute('selected')
    this.li[this.focusIndex].setAttribute('selected', '')
    this.updateValue({ textContent: this.li[this.focusIndex].textContent, className: 'selected' })
    this.setFocus()
    this.fireChangeEvent()
    this.close()
    if (e) e.stopPropagation()
  }

  deselectValue(e) {
    const selected = this.querySelector('li[selected]')
    if (!selected) return e.stopPropagation()
    selected.removeAttribute('selected')
    this.updateValue(this.defaultValue)
    this.focusIndex = 0
    this.setFocus()
    this.open()
    this.fireChangeEvent()
    e.stopPropagation()
  }

  handleMouseEnter(i, e) {
    e.target.focus()
    this.focusIndex = i
  }

  fireChangeEvent() {
    const selected = this.querySelector('li[selected]')
    const detail = selected
      ? { value: selected.value, textContent: selected.textContent }
      : { value: '', textContent: '' }
    this.dispatchEvent(new CustomEvent('change', { detail }))
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
    li.addEventListener('mouseenter', this.handleMouseEnter.bind(this, i))
    this.appendChild(li)
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.handleKeyPress)
    this.removeEventListener('click', this.toggle)
    this.close_icon.removeEventListener('click', this.deselectValue)
    this.dropdown.removeEventListener('click', this.selectValue)
    this.li.forEach(val => (val.remove(), val = null))
  }
}

customElements.define('x-select', Select)
