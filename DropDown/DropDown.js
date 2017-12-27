const template = document.currentScript.ownerDocument.querySelector('#dropdownTemplate')

class DropDown extends HTMLElement {

  constructor() {
    super()
    this.root = this.createShadowRoot()
    this.root.appendChild(template.content.cloneNode(true))

    this.selectedBar = this.root.querySelector('.selected-bar')
    this.label = this.root.querySelector('.label')
    this.arrow = this.root.querySelector('.arrow')
    this.ulContainer = this.root.querySelector('.ul-container')
    this.li = this.querySelectorAll('li')

    this.i = 0
    this.max = this.li.length - 1
    this.hoverCss = 'background: #E9E9E9; outline: dotted 1px #333333;'
  }

  connectedCallback() {
    this.highlightItem(this.i)
    this.attachEventListeners()
  }

  attachEventListeners() {
    this.selectedBar.addEventListener('click', this.selectedBarClicked.bind(this))
    this.ulContainer.addEventListener('click', this.setLabel.bind(this))
    this.li.forEach(val => val.addEventListener('mouseenter', this.mouseEnter.bind(this)))

    document.addEventListener('keydown', this.handleKeyPress.bind(this))
    document.addEventListener('click', this.outsideClick.bind(this))
  }

  selectedBarClicked(e) {
    e.stopPropagation()
    this.toggleDropDown()
  }

  setLabel(e) {
    e.stopPropagation()
    this.label.textContent = e.target.textContent
    this.fireChangeEvent()
    this.toggleDropDown()
  }

  outsideClick() {
    if (this.ulContainer.style.display == 'none') return
    this.toggleDropDown()
  }

  toggleDropDown() {
    this.ulContainer.style.display = this.ulContainer.style.display == 'none'
      ? 'block'
      : 'none'
    this.arrow.getAttribute('transform')
      ? this.arrow.removeAttribute('transform')
      : this.arrow.setAttribute('transform', 'rotate(180, 5, 3)')
  }

  mouseEnter(e) {
    for (let i = 0; i < this.li.length; i++)
      if (this.li[i] == e.target) {
        this.li[this.i].style.cssText = ''
        this.li[this.i = i].style.cssText = this.hoverCss
      }
  }

  handleKeyPress(e) {
    if (this.ulContainer.style.display == 'none') return

    switch(e.which) {
      case 13:
        this.toggleDropDown()
        this.label.textContent = this.li[this.i].textContent
        return this.fireChangeEvent()
      case 27:
        this.highlightItem(this.i, '')
        this.i = 0
        return this.ulContainer.style.display = 'none'
      case 38:
        this.highlightItem(this.i, '')
        this.i = this.i == 0 ? this.max : --this.i
        return this.highlightItem(this.i)
      case 40:
        this.highlightItem(this.i, '')
        this.i = this.i == this.max ? 0 : ++this.i
        return this.highlightItem(this.i)
      default:
        if (e.which > 47 && e.which < 91)
          return this.filterOptions(e.key)
    }
  }

  filterOptions(char) {
    for (let i = 0; i < this.li.length; i++) {
      if (this.li[i].textContent.toLowerCase().startsWith(char)) {
        this.highlightItem(this.i, '')
        return this.highlightItem(this.i = i)
      }
    }
  }

  highlightItem(i, style = this.hoverCss) {
    this.li[i].style.cssText = style
  }

  fireChangeEvent() {
    this.dispatchEvent(new CustomEvent('change'))
  }

  getSelected() {
    return this.label.textContent
  }

}

customElements.define('x-drop-down', DropDown)
