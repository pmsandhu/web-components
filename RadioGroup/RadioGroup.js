const radioGroupTemplate = document.createElement('template')

radioGroupTemplate.innerHTML = `
<link rel="stylesheet" href="./RadioGroup.css">
<div class="radio-group">
  <slot></slot>
</div>`

class RadioGroup extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open', delegatesFocus: false })
    this.shadowRoot.appendChild(radioGroupTemplate.content.cloneNode(true))
    if (this.hasAttribute('stacked'))
      this.shadowRoot.querySelector('.radio-group').classList.add('stacked')
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick)
    this.addEventListener('keydown', this.onKeyDown)
    Promise.all([customElements.whenDefined('x-radio')]).then(_ => this.linkRadios())
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKeyDown)
    this.removeEventListener('click', this.onClick)
  }

  linkRadios() {
    this.radios = this.querySelectorAll('x-radio')
    this.enabledRadios = this.querySelectorAll('x-radio:not([disabled])')
    this.enabledRadios.forEach((val, i) => val.tabindex = i)
    this.checkRadio(findElement(this.radios, 'checked') || this.radios[0])
  }

  checkRadio(radio) {
    this.reset()
    radio.checked = true
    radio.focus()
  }

  reset() {
    this.radios.forEach(val => val.checked = false)
  }

  onClick(e) {
    if (e.target.localName != 'x-radio' || e.target.disabled || e.target.checked) return
    this.checkRadio(e.target)
  }

  onKeyDown(e) {
    if (e.target.localName != 'x-radio' || e.altKey) return

    let radioToCheck

    switch(e.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        radioToCheck = this.prevRadio()
        break

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
      case KEYCODE.TAB:
        radioToCheck = this.nextRadio()
        break

      case KEYCODE.HOME:
        radioToCheck = this.enabledRadios[0]
        break

      case KEYCODE.END:
        radioToCheck = this.radios[this.enabledRadios.length - 1]
        break

      default:
        return
    }

    e.preventDefault()
    this.checkRadio(radioToCheck)
  }

  prevRadio() {
    let idx = findIndex(this.enabledRadios, 'checked') - 1 + this.enabledRadios.length
    return this.enabledRadios[idx % this.enabledRadios.length]
  }

  nextRadio() {
    let idx = findIndex(this.enabledRadios, 'checked') + 1
    return this.enabledRadios[idx % this.enabledRadios.length]
  }

}

customElements.define('x-radio-group', RadioGroup)
