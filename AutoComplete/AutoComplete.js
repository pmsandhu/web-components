const autoCompleteTemplate = document.currentScript.ownerDocument.querySelector('#autoCompleteTemplate')

class AutoComplete extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(autoCompleteTemplate.content.cloneNode(true))

    this.focusIndex = 0
    this.isOpen = false

    this.autoComplete = this.shadowRoot.querySelector('.auto-complete')
    this.bar = this.shadowRoot.querySelector('.bar')
    this.input = this.shadowRoot.querySelector('input')
    this.dropdown = this.shadowRoot.querySelector('.dropdown')
    this.options = this.shadowRoot.querySelector('.options')
    this.arrow = this.shadowRoot.querySelector('.arrow')

    this.li = this.querySelectorAll('li')
    this.optionCount = this.li.length - 1
    // this.defaultValue = { textContent: this.getAttribute('placeholder'), className: 'placeholder' }
    // this.defaultValue = this.input.placeholder
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    // this.updateValue()
  }

  attachAttributes() {
    this.li.forEach((val, i) => val.setAttribute('tabindex', i))
  }

  attachEventHandlers() {
    // this.input.addEventListener('focus', e => (e.target.focus(), e.target.select()))
    // this.input.addEventListener('click', e => e.target.select())
    this.autoComplete.addEventListener('keydown', this.keyDownHandler.bind(this))
    this.options.addEventListener('click', e => (this.selectValue(e.target), e.stopPropagation()))
    this.bar.addEventListener('click', e => {
      if (this.isOpen)  this.close()
      else {
        this.open()
        this.input.focus()
        this.input.select()
        e.stopPropagation()
      }
    })
    this.li.forEach((val, i) => val.addEventListener('mouseenter', e => (e.target.focus(), this.focusIndex = i)))
    // document.addEventListener('click', e => this.isOpen ? this.close() : void(0))
  }

  updateValue(value) {
    console.log(value)
    this.input.value = value
  }

  setFocus() {
    this.li[this.focusIndex].focus()
  }

  selectValue(option) {
    this.li.forEach((val, i) => {
      if (val.hasAttribute('selected') && val != option) val.removeAttribute('selected')
      else if (val == option) {
        val.setAttribute('selected', 'selected')
        this.focusIndex = i
      }
    })
    this.updateValue(option.textContent)
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
      case 27:
        return this.close()
      // DOWN_ARROW
      case 38:
        this.focusIndex = this.focusIndex == 0 ? this.optionCount : --this.focusIndex
        return this.setFocus()
      // UP_ARROW
      case 40:
        this.focusIndex = this.focusIndex == this.optionCount ? 0 : ++this.focusIndex
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
        // this.setFocus()
        return true
      }
    }
    for (let i = 0; i < this.focusIndex; i++) {
      if (this.li[i].textContent.toLowerCase()[method](char)) {
        this.focusIndex = i
        // this.setFocus()
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
    if (val.hasOwnProperty('className')) li.className = val.className
    li.value = val.value
    li.textContent = val.textContent
    li.setAttribute('tabindex', ++this.optionCount)
    this.appendChild(li)
    li.addEventListener('mouseenter', e => (e.target.focus(), this.focusIndex = this.optionCount))
  }
}

customElements.define('x-auto-complete', AutoComplete)
