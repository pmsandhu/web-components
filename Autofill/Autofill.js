class Autofill extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open', delegatesFocus: true })
    this.shadowRoot.appendChild(

      getTemplate('#autofillTemplate').content.cloneNode(true))

    this.previousValue = ''
    this.input = this.shadowRoot.querySelector('input')
    this.filter = null
  }

  static get observedAttributes() {
    return ['placeholder']
  }

  set placeholder(value) {
    this.setAttribute('placeholder', value)
    this.input.placeholder = value
  }

  get placeholder() {
    return this.getAttribute('placeholder')
  }

  connectedCallback() {
    this.input.addEventListener('keydown', this.inputKeyDown)
    this.input.addEventListener('keyup', this.inputKeyUp)
  }

  registerFilterCallback(cb) {
    this.filter = cb.bind(this)
  }

  onEnter = event => this.dispatchEvent(new CustomEvent('enter-keypress', { detail: { event }, bubbles: true, composed: true }))
  onBackspace = event => this.dispatchEvent(new CustomEvent('backspace-keypress', { detail: { event },  bubbles: true, composed: true }))
  onLeftArrow = event => this.dispatchEvent(new CustomEvent('left-arrow-keypress', { detail: { event },  bubbles: true, composed: true  }))


  inputKeyUp = e => {
    if (e.which == KEYCODE.RIGHT) return
    e.stopPropagation()

    if ((e.which == KEYCODE.LEFT) && e.target.selectionStart == 0) this.onLeftArrow(e)
  }

  inputKeyDown = e => {
    if (e.ctrlKey
      || e.metaKey
      || e.which != KEYCODE.BACKSPACE
      && e.which != KEYCODE.ENTER
      && !KEYCODE.IS_CHAR(e)
    ) return

    e.preventDefault()
    e.stopPropagation()

    if (e.which == KEYCODE.ENTER) {
      this.onEnter(e)
      this.input.value = ''
    }

    if (KEYCODE.IS_CHAR(e)) {
      this.onChange(e)
    }

    if ((e.which == KEYCODE.BACKSPACE) && e.target.selectionStart == 0 && e.target.selectionEnd == 0) {
      this.onBackspace(e)
    }

    if ((e.which == KEYCODE.BACKSPACE)) {
      this.onBackspaceWithInput(e)
    }
  }


  onChange({ key, target: { selectionStart, selectionEnd, value } }) {
    this.previousValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd)
    const text = this.filter(this.previousValue.toLowerCase())

    if (!text) return this.setRange(this.previousValue, selectionStart + 1)

    const { length } = this.previousValue
    this.previousValue = text.slice(0, length)
    this.setRange(text, length, text.length)
  }

  onBackspaceWithInput({ target: { selectionStart, selectionEnd, value } }) {
    if (selectionStart == selectionEnd) --selectionStart
    this.previousValue = value.slice(0, selectionStart) + value.slice(selectionEnd)
    this.filter(this.previousValue.toLowerCase())
    this.setRange(this.previousValue, selectionStart)
  }

  setRange(value, rangeStart, rangeEnd = null) {
    this.input.value = value
    if (rangeEnd == null) rangeEnd = rangeStart
    this.input.setSelectionRange(rangeStart, rangeEnd)
  }


}

customElements.define('x-autofill', Autofill)
