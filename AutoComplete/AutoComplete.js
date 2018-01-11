const autoCompleteTemplate = document.currentScript.ownerDocument.querySelector('#autoCompleteTemplate')

// class AutoComplete extends HTMLElement {
//   constructor() {
//     super()
//     this.attachShadow({ mode: 'open' })
//     this.shadowRoot.appendChild(autoCompleteTemplate.content.cloneNode(true))
//
//     this.focusIndex = 0
//     this.isOpen = false
//
//     this.input = this.shadowRoot.querySelector('input')
//     this.autoComplete = this.shadowRoot.querySelector('.auto-complete')
//     this.bar = this.shadowRoot.querySelector('.bar')
//     this.dropdown = this.shadowRoot.querySelector('.dropdown')
//     this.options = this.shadowRoot.querySelector('.options')
//     this.arrow = this.shadowRoot.querySelector('.arrow')
//
//     this.li = this.querySelectorAll('li')
//     this.optionCount = this.li.length - 1
//     // this.defaultValue = { textContent: this.getAttribute('placeholder'), className: 'placeholder' }
//     // this.defaultValue = this.input.placeholder
//   }
//
//   connectedCallback() {
//     this.attachAttributes()
//     this.attachEventHandlers()
//     // this.updateValue()
//   }
//
//   attachAttributes() {
//     this.li.forEach((val, i) => val.setAttribute('tabindex', i))
//   }
//
//   attachEventHandlers() {
//     // this.input.addEventListener('focus', e => (e.target.focus(), e.target.select()))
//     // this.input.addEventListener('click', e => e.target.select())
//     this.autoComplete.addEventListener('keydown', this.keyDownHandler.bind(this))
//     this.options.addEventListener('click', e => (this.selectValue(e.target), e.stopPropagation()))
//     this.bar.addEventListener('click', e => {
//       if (this.isOpen)  this.close()
//       else {
//         this.open()
//         this.input.focus()
//         this.input.select()
//         e.stopPropagation()
//       }
//     })
//     this.li.forEach((val, i) => val.addEventListener('mouseenter', e => (e.target.focus(), this.focusIndex = i)))
//     // document.addEventListener('click', e => this.isOpen ? this.close() : void(0))
//   }
//
//   updateValue(value) {
//     console.log(value)
//     this.input.value = value
//   }
//
//   setFocus() {
//     this.li[this.focusIndex].focus()
//   }
//
//   selectValue(option) {
//     this.li.forEach((val, i) => {
//       if (val.hasAttribute('selected') && val != option) val.removeAttribute('selected')
//       else if (val == option) {
//         val.setAttribute('selected', 'selected')
//         this.focusIndex = i
//       }
//     })
//     this.updateValue(option.textContent)
//     this.setFocus()
//     this.fireChangeEvent()
//     this.close()
//   }
//
//   open() {
//     this.isOpen = true
//     this.arrow.setAttribute('transform', 'rotate(180, 5, 3)')
//     this.dropdown.style.display = 'block'
//     this.setFocus()
//   }
//
//   close() {
//     this.isOpen = false
//     this.arrow.removeAttribute('transform')
//     this.dropdown.style.display = 'none'
//     this.bar.focus()
//   }

const makeRegularExpression = input => {

  const escaped = []
  const reserved = '.?*+!()[]/$^'
  for (let i = 0; i < input.length; i++) {
    escaped.push(reserved.includes(input[i]) ? '\\' + input[i] : input[i])
  }
  return new RegExp(escaped.join(''), 'i')
}

class AutoComplete extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(getTemplate('#autoCompleteTemplate').content.cloneNode(true))
    this.focusIndex = 0
    this.isOpen = false

    this.selectBox = this.shadowRoot.querySelector('.box')
    this.input = this.shadowRoot.querySelector('input')
    this.dropdown = this.shadowRoot.querySelector('.dropdown')

    this.x_icon = this.shadowRoot.querySelector('.x_icon')
    this.arrow_icon = this.shadowRoot.querySelector('.arrow_icon  > path')

    this.li = this.querySelectorAll('li')
    // this.defaultValue = {
    //   textContent: this.getAttribute('placeholder') || 'Select ...',
    //   className: 'placeholder'
    // }
  }

  connectedCallback() {
    this.attachAttributes()
    this.attachEventHandlers()
    this.setUpSlotDefinedDefaults()
  }

  attachAttributes() {
    this.dropdown.hidden = true
    this.selectBox.setAttribute('tabindex', -1)
    this.li.forEach((val, i) => val.setAttribute('tabindex', i))
  }

  attachEventHandlers() {
    this.addEventListener('click', this.toggle)
    this.addEventListener('keyup', this.handleKeyPress)
    this.dropdown.addEventListener('click', this.selectValue.bind(this))
    this.x_icon.addEventListener('click', this.deselectValue.bind(this))
    this.li.forEach(val => val.addEventListener('mouseenter', this.handleMouseEnter.bind(this)))

    document.addEventListener('click', e => this.isOpen ? this.close() : void(0))
  }

  setUpSlotDefinedDefaults() {
    const hasDefaultSelection = this.querySelector('li[selected]')
    if (!hasDefaultSelection) return /*this.updateValue(this.defaultValue)*/
    this.focusIndex = hasDefaultSelection.tabIndex
    this.selectValue()
  }

  updateValue(textContent, className) {
    this.x_icon.style.display = className == 'placeholder' ? 'none' : 'block'
    this.input.setAttribute('placeholder', textContent)
    console.log(this.input)
    this.input.value = ''
    this.focusIndex = 0
    this.input.className = className
  }

  selectValue(e) {
    const currentSelected = this.querySelector('li[selected]')
    if (currentSelected) currentSelected.removeAttribute('selected')
    if (!e.target.hasAttribute('selected')) {
      e.target.setAttribute('selected', '')
    }
    this.updateValue(e.target.textContent, 'selected')
    // this.setFocus()
    this.fireChangeEvent()
    this.close()
    if (e) e.stopPropagation()
  }

  setFocus() {
    const visibleOptions = this.getVisibleOptions()
    if (visibleOptions.length) visibleOptions[this.focusIndex].focus()  }

  open() {
    this.isOpen = true
    this.arrow_icon.setAttribute('transform', 'rotate(180, 5, 3)')
    this.dropdown.hidden = false
    this.input.focus()
    this.input.select()
    // this.setFocus()
  }

  close() {
    this.isOpen = false
    this.arrow_icon.removeAttribute('transform')
    this.dropdown.hidden = true
    this.selectBox.focus()
  }

  toggle(e) {
    this.isOpen ? this.close() : this.open()
    e.stopPropagation()
  }

  getVisibleOptions() {
    return this.querySelectorAll('li:not([hidden]')
  }

  handleKeyPress(e) {
    switch(e.which) {

      // case KEYCODE.BACKSPACE:
      //   this.deselectValue(e)
      //   break

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
        if (this.isOpen) this.selectValue(e)
        else this.open()
        break

      default:
        this.input.focus()
        this.filter(this.input.value)
        break
    }
  }

  filter(value) {
    if (escape(value).includes('%5C')) return
    const regEx = makeRegularExpression(value)
    this.li.forEach(val => {
      val.hidden = !regEx.test(val.textContent)
      console.log(val.textContent, regEx.test(val.textContent))
    })
  }

  deselectValue(e) {
    const selected = this.querySelector('li[selected]')
    if (!selected) return e.stopPropagation()
    selected.removeAttribute('selected')
    this.updateValue('', 'placeholder')
    this.focusIndex = 0
    this.setFocus()
    this.open()
    this.fireChangeEvent()
    e.stopPropagation()
  }

  handleMouseEnter(i, e) {
    e.target.focus()
    let i = 0
    const visibleOptions = this.getVisibleOptions()
    while (visibleOptions[i] != e.target) ++i
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
    this.x_icon.removeEventListener('click', this.deselectValue)
    this.dropdown.removeEventListener('click', this.selectValue)
    this.li.forEach(val => (val.remove(), val = null))
  }
}

customElements.define('x-auto-complete', AutoComplete)
