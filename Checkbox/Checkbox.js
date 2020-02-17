const checkboxTemplate = document.createElement('template')

checkboxTemplate.innerHTML = `
<link rel="stylesheet" href="./Checkbox.css">

<label class="control checkbox">
  <input type="checkbox" class="control-input">
  <span class="control-indicator"></span>
  <span class="label"></span>
</label>
`

class Checkbox extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(checkboxTemplate.content.cloneNode(true))
    this.checkbox = this.shadowRoot.querySelector('.checkbox')
    this.label = this.shadowRoot.querySelector('.label')
    this.input = this.shadowRoot.querySelector('input')
  }

  connectedCallback() {
    this.attachListeners()
    this.label.textContent = this.textContent
    if (this.hasAttribute('disabled')) this.input.disabled = true
    if (this.hasAttribute('checked')) this.input.checked = true
    if (this.hasAttribute('value')) this.input.value = this.getAttribute('value')
    if (this.hasAttribute('stacked')) this.checkbox.classList.add('stacked')
    this.setAttribute('tabindex', -1)
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
