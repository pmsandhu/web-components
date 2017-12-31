const template = document.currentScript.ownerDocument.querySelector('#radioTemplate')

class Radio extends HTMLElement {
  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))
    this.form = this.root.querySelector('form')
    this.name = this.hasAttribute('name') ? this.getAttribute('name') : 'radio'
    this.stacked =  this.hasAttribute('stacked') ? 'stacked' : ''
    this.label = this.querySelectorAll('label')
  }

  connectedCallback() {
    this.label.forEach(val => {
      this.addRadioClasses(val)
      this.createRadioButton(val)
      this.attachListeners(val.querySelector('input'))
    })
  }

  createRadioButton(label) {
    label.innerHTML = `<input 
      type="radio" 
      class="control-input" 
      name="${this.name}" 
      value="${label.getAttribute('value')}" 
      ${this.getDefaults(label)}
    >
      <span class="control-indicator"></span>
      <span class="label">${label.textContent}</span>`
  }

  addRadioClasses(label) {
    label.classList.add('control')
    label.classList.add('radio')
    label.classList.add(this.stacked)
  }

  getDefaults(label) {
    let input = ''
    if (label.hasAttribute('disabled')) input += 'disabled'
    if (label.hasAttribute('checked')) input += ' checked'
    return input
  }

  attachListeners(input) {
    input.onchange = e => this.fireChangeEvent({
      checked: e.target.checked,
      disabled: e.target.disabled,
      value: e.target.value,
      label: e.target.nextElementSibling.nextElementSibling.textContent
    })
  }

  fireChangeEvent(detail) {
    this.dispatchEvent(new CustomEvent(`${this.name}-changed`, { detail }))
  }

}

customElements.define('x-radio', Radio)
