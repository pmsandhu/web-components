const template = document.currentScript.ownerDocument.querySelector('#tabsTemplate')
const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  HOME: 36,
  END: 35,
}

class Tabs extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));


    this.onSlotChange = this.onSlotChange.bind(this)
    this.tabSlot = this.shadowRoot.querySelector('slot[name=tab]')
    this.panelSlot = this.shadowRoot.querySelector('slot[name=panel]')
    this.tabSlot.addEventListener('slotchange', this.onSlotChange)
    this.panelSlot.addEventListener('slotchange', this.onSlotChange)

  }

  connectedCallback() {
    this.addEventListener('keydown', this.onKeyDown)
    this.addEventListener('click', this.onClick)
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tablist')

    Promise.all([
      customElements.whenDefined('x-tab'),
      customElements.whenDefined('x-panel'),
    ]).then(_=> this.linkPanels())
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKeyDown)
    this.removeEventListener('click', this.onClick)
  }

  onSlotChange() {
    this.linkPanels()
  }

  linkPanels() {
    const tabs = this.allTabs()
    tabs.forEach(tab => {
      const panel = tab.nextElementSibling
      if (panel.tagName.toLowerCase() !== 'x-panel')
        return console.error(`Tab #${tab.id} is not a sibling of a <x-panel>`)
      tab.setAttribute('aria-controls', panel.id)
      panel.setAttribute('aria-labelledby', tab.id)
    })
    const selectedTab = tabs.find(tab => tab.selected) || tabs[0]
    this.selectTab(selectedTab)
  }

  allPanels() {
    return Array.from(this.querySelectorAll('x-panel'))
  }

  allTabs() {
    return Array.from(this.querySelectorAll('x-tab'))
  }

  panelForTab(tab) {
    const panelId = tab.getAttribute('aria-controls')
    return this.querySelector(`#${panelId}`)
  }

  prevTab() {
    const tabs = this.allTabs()
    let newIdx = tabs.findIndex(tab => tab.selected) - 1
    return tabs[(newIdx + tabs.length) % tabs.length]
  }

  firstTab() {
    const tabs = this.allTabs()
    return tabs[0]
  }

  lastTab() {
    const tabs = this.allTabs()
    return tabs[tabs.length - 1]
  }

  nextTab() {
    const tabs = this.allTabs()
    let newIdx = tabs.findIndex(tab => tab.selected) + 1
    return tabs[newIdx % tabs.length]
  }

  reset() {
    const tabs = this.allTabs()
    const panels = this.allPanels()

    tabs.forEach(tab => tab.selected = false)
    panels.forEach(panel => panel.hidden = true)
  }

  selectTab(newTab) {
    this.reset()
    const newPanel = this.panelForTab(newTab)
    if (!newPanel)
      throw new Error(`No panel with id ${newPanelId}`)
    newTab.selected = true
    newPanel.hidden = false
    newTab.focus()
  }

  onKeyDown(event) {
    if (event.target.getAttribute('role') !== 'tab')
      return
    if (event.altKey)
      return
    let newTab
    switch(event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this.prevTab()
        break

      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
        newTab = this.nextTab()
        break

      case KEYCODE.HOME:
        newTab = this.firstTab()
        break

      case KEYCODE.END:
        newTab = this.lastTab()
        break

      default:
        return
    }
    event.preventDefault()
    this.selectTab(newTab)

  }

  onClick(event) {
    if (event.target.getAttribute('role') !== 'tab') return
    this.selectTab(event.target)
  }
}

customElements.define('x-tabs', Tabs)

let tabCounter = 0;
class Tab extends HTMLElement {

  static get observedAttributes() {
    return ['selected']
  }

  constructor() {
    super()
  }

  connectedCallback() {
    this.setAttribute('role', 'tab')
    if (!this.id)
      this.id = `x-tab-generated-${tabCounter++}`
    this.setAttribute('aria-selected', 'false')
    this.setAttribute('tabindex', -1)
    this.upgradeProperty('selected')
  }

  upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }

  attributeChangedCallback() {
    const value = this.hasAttribute('selected')
    this.setAttribute('aria-selected', value)
    this.setAttribute('tabindex', value ? 0 : -1)
  }

  set selected(value) {
    value = Boolean(value)
    if (value) this.setAttribute('selected', '')
    else this.removeAttribute('selected')
  }

  get selected() {
    return this.hasAttribute('selected')
  }
}

customElements.define('x-tab', Tab)

let panelCounter = 0
class Panel extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.setAttribute('role', 'tabpanel')
    if (!this.id)
      this.id = `x-panel-generated-${panelCounter++}`
  }
}

customElements.define('x-panel', Panel)


