const template = document.currentScript.ownerDocument.querySelector('#selectTemplate')

class Select extends HTMLElement {
  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))

    this.focusIndex = 0
    this.isOpen = false

    this.select = this.root.querySelector('.select')
    this.bar = this.root.querySelector('.bar')
    this.value = this.root.querySelector('#value')
    this.dropdown = this.root.querySelector('.dropdown')
    this.options = this.root.querySelector('.options')
    this.arrow = this.root.querySelector('.arrow')

    this.li = this.querySelectorAll('li')
    this.optionCount = this.li.length - 1
    this.defaultValue = { textContent: this.getAttribute('placeholder'), className: 'placeholder' }
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    this.updateValue()
  }

  attachAttributes() {
    this.li.forEach((val, i) => val.setAttribute('tabindex', i))
  }

  attachEventHandlers() {
    this.select.addEventListener('keydown', this.keyDownHandler.bind(this))
    this.options.addEventListener('click', e => (this.selectValue(e.target), e.stopPropagation()))
    this.bar.addEventListener('click', e => (this.isOpen ? this.close() : this.open(), e.stopPropagation()))
    this.li.forEach((val, i) => val.addEventListener('mouseenter', e => (e.target.focus(), this.focusIndex = i)))
    document.addEventListener('click', e => this.isOpen ? this.close(): void(0))
  }

  updateValue(value = this.defaultValue) {
    this.value.textContent = value.textContent
    this.value.className = value.className
  }

  setFocus() {
    this.li[this.focusIndex].focus()
  }

  selectValue(option) {

    this.li.forEach((val, i) => {
      if (val.hasAttribute('selected') && val != option)
        val.removeAttribute('selected')
      else if (val == option) {
        val.setAttribute('selected', 'selected')
        this.focusIndex = i
      }
    })
    this.updateValue({ textContent: option.textContent, className: 'selected' })
    this.setFocus()
    this.fireChangeEvent()
    this.close()
  }

  open() {
    this.isOpen = true
    this.arrow.setAttribute('transform', 'rotate(180, 5, 3)')
    this.dropdown.style.display = 'block'
    this.setFocus()
  }

  close() {
    this.isOpen = false
    this.arrow.removeAttribute('transform')
    this.dropdown.style.display = 'none'
    this.bar.focus()
  }

  keyDownHandler(e) {
    switch(e.which) {
      // BACKSPACE
      case 8:
        this.li.forEach(val=> val.removeAttribute('selected'))
        this.updateValue()
        this.focusIndex = 0
        this.setFocus()
        return this.fireChangeEvent()
      // ESCAPE
      case 27:
        return this.close()
      // DOWN_ARROW
      case 38:
        this.focusIndex = this.focusIndex == 0 ? this.optionCount: --this.focusIndex
        return this.setFocus()
      // UP_ARROW
      case 40:
        this.focusIndex = this.focusIndex == this.optionCount? 0 : ++this.focusIndex
        return this.setFocus()
      // ENTER
      case 13:
        if (this.isOpen) return this.selectValue(this.li[this.focusIndex])
      default:
        if (e.which > 47 && e.which < 91)
          if (!this.filterMethod(e.key, 'startsWith'))
            this.filterMethod(e.key, 'includes')
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

  fireChangeEvent() {
    const detail = this.getValue()
    this.dispatchEvent(new CustomEvent('change', { detail }))
  }

  getValue() {
    const selected = this.querySelector('li[selected]')
    return selected
      ? { value: selected.value, textContent: selected.textContent }
      : { value: '', textContent: '' }
  }
}

customElements.define('x-select', Select)
