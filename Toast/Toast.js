const toastTemplate = document.createElement('template')
toastTemplate.innerHTML = `
<link rel="stylesheet" href="./Toast.css">

  <div class="toast">
    <div class="message"></div>
    <div class="close"><span>X</span></div>
  </div>
`

export default class Toast extends HTMLElement {
  static get observedAttributes() {
    return ['position', 'message']
  }

  get position() { return this.getAttribute('position') }
  set position(val) { this.setAttribute('position', val) }

  get message() { return this.getAttribute('message') }
  set message(val) { this.setAttribute('message', val) }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(toastTemplate.content.cloneNode(true))
    this.toast = this.shadowRoot.querySelector('.toast')
    this.close = this.shadowRoot.querySelector('.close')
    this.message_div = this.shadowRoot.querySelector('.message')
  }

  connectedCallback() {
    const [y, x] = this.position.split('-')
    this.toast.classList.add(y)
    this.toast.classList.add(x)
    this.message_div.innerHTML = this.message

    this.attachListeners()
    this.attachAnimations()
  }

  disconnectedCallback() {
    console.log('removing')
    this.removeEventListener('click', this.removeToast)
    this.root = null
  }
    attachListeners() {
    this.close.addEventListener('click', this.removeToast.bind(this))
  }

  attachAnimations() {
    setTimeout(() => requestAnimationFrame(() => this.toast.classList.add('slide-out')), 4000)
    setTimeout(() => this.removeToast(), 5000)
  }

  removeToast() {
    this.remove()
  }
}

customElements.define('x-toast', Toast)
