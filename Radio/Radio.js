const radioTemplate = document.currentScript.ownerDocument.querySelector('#radioTemplate')

class Radio extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled', 'checked', 'tabindex']
  }

  get value()    { return this.getAttribute('value') }
  get checked()  { return this.hasAttribute('checked') }
  get tabindex() { return this.getAttribute('tabindex') }
  get disabled() { return this.hasAttribute('disabled') }

  set tabindex(val) { this.setAttribute('tabindex', val) }
  set value(val)    { this.setAttribute('value', val) }
  set disabled(val) { val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled') }
  set checked(val)  { val ? this.setAttribute('checked', '')  : this.removeAttribute('checked') }

  constructor() {
    super()
    this.attachShadow({ mode: 'open', delegatesFocus: true })
    this.shadowRoot.appendChild(radioTemplate.content.cloneNode(true))
    this.radio = this.shadowRoot.querySelector('.radio')
    this.label = this.shadowRoot.querySelector('.label')
    this.input = this.shadowRoot.querySelector('input')
  }

  connectedCallback() {
    this.attachListeners()
    this.label.textContent = this.textContent
  }

  attributeChangedCallback(attribute) {
    if (attribute == 'tabindex') return
    this.input[attribute] = this[attribute]
  }

  attachListeners() {
    this.input.onchange = e => this.fireChangeEvent({
      checked: e.target.checked,
      disabled: e.target.disabled,
      value: e.target.value
    })
  }

  fireChangeEvent(detail) {
    this.dispatchEvent(new CustomEvent('radio-changed', { detail }))
  }

}

customElements.define('x-radio', Radio)
