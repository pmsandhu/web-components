const checkboxTemplate = document.currentScript.ownerDocument.querySelector('#checkboxTemplate')

class Checkbox extends HTMLElement {
  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(checkboxTemplate.content.cloneNode(true))
    this.checkbox = this.root.querySelector('.checkbox')
    this.label = this.root.querySelector('.label')
    this.input = this.root.querySelector('input')
  }

  connectedCallback() {
    this.attachListeners()
    this.label.textContent = this.textContent
    if (this.hasAttribute('disabled')) this.input.disabled = true
    if (this.hasAttribute('checked')) this.input.checked = true
    if (this.hasAttribute('value')) this.input.value = this.getAttribute('value')
    if (this.hasAttribute('stacked')) this.checkbox.classList.add('stacked')
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

customElements.define('x-checkbox', Checkbox)
