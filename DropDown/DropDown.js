const DOC = document.currentScript.ownerDocument
const template = DOC.querySelector('#template')

class DropDown extends HTMLElement {
  connectedCallback(){
    this.initShadowRoot()
    this.initSelectors()
    this.initListeners()
  }

  initShadowRoot() {
    const root = this.createShadowRoot()
    root.appendChild(template.content.cloneNode(true))
    this.root = root
  }

  qs(selector) { return this.root.querySelector(selector) }

  initSelectors() {
    this.control = this.qs('.main')
    this.toggle = this.qs('#toggle')
    this.path = this.qs('#path')
    this.inputBar = this.qs('.input-bar')
    this.label = this.qs('.label')
    this.dropdown = this.qs('.dropdown')
    this.max = this.dropdown.children.length - 1
    this.i = -1
  }

  initListeners() {
    this.inputBar.addEventListener('click', this.inputBarClicked.bind(this))
    this.dropdown.addEventListener('click', this.setLabel.bind(this))
    document.addEventListener('click', this.outsideClick.bind(this))
    document.addEventListener('keydown', this.handleKeyPress.bind(this))
    for (let i = 0; i < this.max; i++)
      this.dropdown.children[i].addEventListener('mouseenter', this.mouseEnter.bind(this))
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
    if (this.toggle.style.display === 'none') return
    this.toggleDropDown()
  }

  toggleDropDown() {
    this.toggle.style.display = this.toggle.style.display === 'none' ? 'block' : 'none'
    this.path.getAttribute('transform')
      ? this.path.removeAttribute('transform')
      : this.path.setAttribute('transform', 'rotate(180, 5, 3)')
  }

  mouseEnter(e) {
    for (let i = 0; i < this.max; i++)
      if (this.dropdown.children[i] === e.target) {
        this.dropdown.children[this.i].style.background = ''
        this.dropdown.children[this.i = i].style.background = 'rgba(0, 0, 0, .15)'
      }
  }

  handleKeyPress(e) {
    if (this.toggle.style.display === 'none' || ![40, 38, 27, 13].some(val => val == e.which)) return

    if ((e.which == 40 || e.which == 13) && this.i == -1)
      return this.dropdown.children[++this.i].style.background = 'rgba(0, 0, 0, .15)'

    if (e.which == 38 && this.i == -1)
      return this.dropdown.children[this.i = this.max].style.background = 'rgba(0, 0, 0, .15)'

    if (e.which == 13) {
      this.toggleDropDown()
      return this.label.textContent = this.dropdown.children[this.i].textContent
    }

    if (e.which == 27) {
      if (this.i != -1) this.dropdown.children[this.i].style.background = ''
      this.i = -1
      return this.toggleDropDown()
    }

    this.dropdown.children[this.i].style.background = ''
    if (e.which == 40 && this.i == this.max) return this.dropdown.children[this.i = 0].style.background = 'rgba(0, 0, 0, .15)'
    if (e.which == 38 && this.i == 0) return this.dropdown.children[this.i = this.max].style.background = 'rgba(0, 0, 0, .15)'
    if (e.which == 40) return this.dropdown.children[++this.i].style.background = 'rgba(0, 0, 0, .15)'
    if (e.which == 38) return this.dropdown.children[--this.i].style.background = 'rgba(0, 0, 0, .15)'
  }

}

customElements.define('x-drop-down', DropDown)
