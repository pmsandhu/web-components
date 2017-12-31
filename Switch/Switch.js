const template = document.currentScript.ownerDocument.querySelector('#switchTemplate')

class Switch extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'checked', 'value']
  }

  get disabled() { return this.hasAttribute('disabled') }
  set disabled(val) { this.input.setAttribute('disabled', '') }

  get checked() { return this.hasAttribute('checked') }
  set checked(val) { this.input.setAttribute('checked', '') }

  get value() { return this.hasAttribute('value') }
  set value(val) { this.input.setAttribute('value', val) }

  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))
    this.switch = this.root.querySelector('.switch')
    this.label = this.root.querySelector('.label')
    this.input = this.root.querySelector('input')
  }

  connectedCallback() {
    this.attachListeners()

    if (this.disabled) this.disabled = true
    if (this.checked) this.checked = true
    if (this.value) this.value = this.getAttribute('value')

    this.label.textContent = this.getAttribute('label')
  }

  attachListeners() {
    this.input.onchange = e => this.fireChangeEvent({
      checked: e.target.checked,
      disabled: e.target.disabled,
      value: e.target.value
    })
  }

  fireChangeEvent(detail) {
    this.dispatchEvent(new CustomEvent('change', { detail }))
  }

}

customElements.define('x-switch', Switch)
