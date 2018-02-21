class FancyButton extends HTMLButtonElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.addEventListener('mousedown', this.drawRipple)
    this.addEventListener('mouseup', this.cleanup)
    this.init()
  }

  init() {
    this.rippleContainer = document.createElement('div')
    this.rippleContainer.className = 'ripple'
    this.appendChild(this.rippleContainer)
  }

  drawRipple(e) {
    const span = document.createElement('span')
    const { offsetWidth } = this
    const { left, top } = this.getBoundingClientRect()
    const x = e.pageX - left - (offsetWidth / 2)
    const y = e.pageY - top - (offsetWidth / 2)
    span.style.cssText =
      `top: ${y}px; 
       left: ${x}px; 
       height: ${offsetWidth}px; 
       width: ${offsetWidth}px;`

    this.rippleContainer.appendChild(span)
  }

  cleanup() {
    setTimeout(() => this.rippleContainer.removeChild(this.rippleContainer.firstChild), 2000)
  }
}

customElements.define('fancy-button', FancyButton, { extends: 'button' })
