const DOC = document.currentScript.ownerDocument
const template = DOC.querySelector('#template')

class DropDown extends HTMLElement {
  qs(selector) { return this.root.querySelector(selector) }

  connectedCallback() {
    this.initShadowRoot()
    this.initDOMSelectors()
    this.initGlobals()
    this.initListeners()
  }

  initShadowRoot() {
    const root = this.createShadowRoot()
    root.appendChild(template.content.cloneNode(true))
    this.root = root
  }

  initDOMSelectors() {
    this.inputBar = this.qs('.input-bar')
    this.label = this.qs('.label')
    this.arrow = this.qs('.arrow')
    this.dropdown = this.qs('.dropdown')
    this.li = this.querySelectorAll('li')
  }

  initGlobals() {
    this.max = this.li.length - 1
    this.i = 0
    this.highlightItem(this.i)
   }


  initListeners() {
    this.inputBar.addEventListener('click', this.inputBarClicked.bind(this))
    this.dropdown.addEventListener('click', this.setLabel.bind(this))
    for (const i of this.li) i.addEventListener('mouseenter', this.mouseEnter.bind(this))

    document.addEventListener('keydown', this.handleKeyPress.bind(this))
    document.addEventListener('click', this.outsideClick.bind(this))
  }

  inputBarClicked(e) {
    e.stopPropagation()
    this.toggleDropDown()
  }

  setLabel(e) {
    e.stopPropagation()
    this.label.textContent = e.target.textContent
    this.toggleDropDown()
  }

  outsideClick() {
    if (this.dropdown.style.display == 'none') return
    this.toggleDropDown()
  }

  toggleDropDown() {
    this.dropdown.style.display = this.dropdown.style.display === 'none'
      ? 'block'
      : 'none'
    this.arrow.getAttribute('transform')
      ? this.arrow.removeAttribute('transform')
      : this.arrow.setAttribute('transform', 'rotate(180, 5, 3)')
  }

  mouseEnter(e) {
    for (let i = 0; i < this.li.length; i++)
      if (this.li[i] == e.target) {
        this.li[this.i].style.background = ''
        this.li[this.i = i].style.background = 'rgba(0, 0, 0, .15)'
      }
  }

  handleKeyPress(e) {
    if (this.dropdown.style.display == 'none') return
    switch(e.which) {
      case(13):
        this.toggleDropDown()
        return this.label.textContent = this.li[this.i].textContent
      case(27):
        this.highlightItem(this.i, '')
        this.i = 0
        return this.dropdown.style.display = 'none'
      case(38):
        this.highlightItem(this.i, '')
        this.i = this.i == 0 ? this.max : --this.i
        return this.highlightItem(this.i)
      case(40):
        this.highlightItem(this.i, '')
        this.i = this.i == this.max ? 0 : ++this.i
        return this.highlightItem(this.i)
      default:
        return
    }
  }

  highlightItem(i, style='rgba(0, 0, 0, .15)') {
    this.li[i].style.background = style
  }

}

customElements.define('x-drop-down', DropDown)
