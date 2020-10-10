const tabsTemplate = document.createElement('template')

tabsTemplate.innerHTML = `
  <link rel="stylesheet" href="./Tabs.css">
  <slot name="tab"></slot>
  <slot name="panel"></slot>
`

class Tabs extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(tabsTemplate.content.cloneNode(true))
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick)
    this.addEventListener('keydown', this.onKeyDown)

    Promise.all([
      customElements.whenDefined('x-tab'),
      customElements.whenDefined('x-panel'),
    ]).then(_ => this.linkPanels())
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKeyDown)
    this.removeEventListener('click', this.onClick)
  }

  linkPanels() {
    this.panels = this.querySelectorAll('x-panel')
    this.tabs = this.querySelectorAll('x-tab')
    this.selectTab(findElement(this.tabs) || this.tabs[0])
  }

  selectTab(tab) {
    if (!tab) return
    this.reset()
    tab.selected = true
    if (tab.nextElementSibling) tab.nextElementSibling.hidden = false
    tab.focus()
  }

  reset() {
    this.tabs.forEach(val => val.selected = false)
    this.panels.forEach(val => val.hidden = true)
  }

  onClick(e) {
    if (e.target.localName != 'x-tab') return
    this.selectTab(e.target)
  }

  onKeyDown(e) {
    if (e.target.localName != 'x-tab' || e.altKey) return
    let newTab

    switch(e.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this.prevTab()
        break

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
      case KEYCODE.TAB:
        newTab = this.nextTab()
        break

      case KEYCODE.HOME:
        newTab = this.tabs[0]
        break

      case KEYCODE.END:
        newTab = this.tabs[this.tabs.length - 1]
        break

      default:
        return
    }

    e.preventDefault()
    this.selectTab(newTab)
  }

  prevTab() {
    let idx = findIndex(this.tabs) - 1 + this.tabs.length
    return this.tabs[idx % this.tabs.length]
  }

  nextTab() {
    let idx = findIndex(this.tabs) + 1
    return this.tabs[idx % this.tabs.length]
  }
}

let tabIndex = 0

class Tab extends HTMLElement {
  constructor() { super() }

  static get observedAttributes() {
    return ['selected']
  }

  set selected(value) {
    value ? this.setAttribute('selected', '') : this.removeAttribute('selected')
  }

  get selected() {
    return this.hasAttribute('selected')
  }

  connectedCallback() {
    this.setAttribute('tabindex', ++tabIndex)
  }

  attributeChangedCallback() {
    const detail = { selected: this.selected, panel: this.nextElementSibling }
    this.dispatchEvent(new CustomEvent('tabSelection', { detail }))
  }
}

class Panel extends HTMLElement {
  constructor() { super() }
}
setTimeout(() => {
customElements.define('x-tabs', Tabs)
customElements.define('x-tab', Tab)
customElements.define('x-panel', Panel)
}, 3000)
