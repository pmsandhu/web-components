const template = document.currentScript.ownerDocument.querySelector('#toastTemplate')

class Toast extends HTMLElement {
  static get observedAttributes() {
    return ['position', 'message']
  }

  get position() { return this.getAttribute('position') }
  set position(val) { this.setAttribute('position', val) }

  get message() { return this.getAttribute('message') }
  set message(val) { this.setAttribute('message', val) }

  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))
    this.toast = this.root.querySelector('.toast')
    this.close = this.root.querySelector('.close')
    this.message_div = this.root.querySelector('.message')
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
