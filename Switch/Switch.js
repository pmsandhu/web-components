const switchTemplate = document.createElement('template')
switchTemplate.innerHTML = `
<link rel="stylesheet" href="./Switch.css">

<label class="switch">
  <input type="checkbox"/>
  <span class="circle"></span>
  <span class="label"></span>
</label>

`
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
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(switchTemplate.content.cloneNode(true))
    this.switch = this.shadowRoot.querySelector('.switch')
    this.label = this.shadowRoot.querySelector('.label')
    this.input = this.shadowRoot.querySelector('input')
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
