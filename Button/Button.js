const buttonTemplate = document.createElement('template')
buttonTemplate.innerHTML =  `
<link rel="stylesheet" href="./Button.css">

<div class="container">
  <button>Label</button>
</div>
`

class Button extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(buttonTemplate.content.cloneNode(true))
    this.button = this.shadowRoot.querySelector('button')
    this.container = this.shadowRoot.querySelector('.container')

    this.button.addEventListener('click', this.onClick)
  }

  get label() {
    return this.getAttribute('label')
  }

  set label(value) {
    this.setAttribute('label', value)
  }

  static get observedAttributes() {
    return ['label']
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this.render()
  }

  connectedCallback() {
    if (this.hasAttribute('as-atom')) {
      this.container.style.padding = '0'
    }
  }

  onClick = e => {
    this.dispatchEvent(new CustomEvent('onClick', { detail: 'Button Clicked!'}))
  }

  render() {
    this.button.textContent = this.label
  }
}

window.customElements.define('x-button', Button)

