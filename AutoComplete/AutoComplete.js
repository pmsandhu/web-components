class AutoComplete extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(getTemplate('#autoCompleteTemplate').content.cloneNode(true))
    this.minChars = 1
    this.delay = 150
    this.offsetleft = 0
    this.offsettop = 1
    this.cache = {}
    this.options = []
    this.input = this.shadowRoot.querySelector('input')
    this.dropdown = this.shadowRoot.querySelector('.dropdown')
  }

  connectedCallback() {
    if (this.hasAttribute('placeholder')) this.input.placeholder = this.getAttribute('placeholder')
    if (this.hasAttribute('name')) this.input.name = this.getAttribute('name')
    if (this.hasAttribute('min-chars')) this.minChars = this.getAttribute('min-chars')
    if (this.hasAttribute('offsetleft')) this.offsetleft = this.getAttribute('offsetleft')
    if (this.hasAttribute('offsettop')) this.offsettop = this.getAttribute('offsettop')
  }

  init(data) {
    this.options = data
    this.attachAttributes()
    this.attachEventListeners()
  }

  attachAttributes() {
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('spellcheck', false)
    this.input.last_val = ''
  }

  attachEventListeners() {
    window.addEventListener('resize', this.updateSize.bind(this))

    this.dropdown.addEventListener('mouseleave', this.mouseLeave.bind(this))
    this.dropdown.addEventListener('mouseover', this.mouseOver.bind(this))
    this.dropdown.addEventListener('mousedown', this.mouseDown.bind(this))

    this.input.addEventListener('blur', this.blur.bind(this))
    this.input.addEventListener('keyup', this.keyUp.bind(this))
    this.input.addEventListener('keydown', this.keyDown.bind(this))
  }

  dropdownDisplay(style) {
    this.dropdown.style.display = style
  }

  isDropdownHidden() {
    return this.dropdown.style.display == 'none'
  }

  mouseLeave(e) {
    if (!e.target.classList.contains('option')) return
    const s = this.dropdown.querySelector('.option.selected')
    if (s) setTimeout(_ => s.className = 'option', 20)
  }

  mouseOver(e) {
    if (!e.target.classList.contains('option')) return
    const s = this.dropdown.querySelector('.option.selected')
    if (s) s.className = 'option'
    e.target.className += ' selected'
  }

  mouseDown(e) {
    if (!e.target.classList.contains('option')) return
    const value = e.target.getAttribute('data-val')
    this.input.value = value
    this.onSelect(e, value, this)
    this.dropdownDisplay('none')
  }

  blur(e) {
    if (!document.querySelector('.list:hover')) {
      this.input.last_val = this.input.value
      this.dropdownDisplay('none')
      setTimeout(_ => this.dropdownDisplay('none'), 350)
    } else if (this.input !== document.activeElement) {
      setTimeout(_e => this.input.focus(), 20)
    }
  }

  focus(e) {
    this.input.last_val = '\n'
    this.keyUp(e)
  }

  keyUp(e) {
    let key = e.which
    if (!((key < KEYCODE.END || key > KEYCODE.DOWN)
        && key != KEYCODE.ENTER
        && key != KEYCODE.ESCAPE)) return

    const value = this.input.value

    if (!(value.length >= this.minChars)) {
      this.input.last_val = value
      this.dropdownDisplay('none')
    }

    if (value == this.input.last_val) return

    this.input.last_val = value
    clearTimeout(this.input.timer)

    if (!this.cache) return
    if (value in this.cache)
      return this.suggest(this.cache[value])

    for (let i = 1; i < value.length - this.minChars; i++) {
      const part = value.slice(0, value.length - i)
      if (part in this.cache && !this.cache[part].length)
        return this.suggest([])
    }

    this.input.timer = setTimeout(_ => this.source(value, this.suggest), this.delay)
  }

  keyDown(e) {
    const prev = this.dropdown.querySelector('.selected')
    let next
    switch(e.which) {

      case KEYCODE.DOWN:
        if (this.isDropdownHidden()) return this.dropdownDisplay('block')
        if (prev) {
          prev.className = 'option'
          next = prev.nextSibling
        } else {
          next = this.dropdown.querySelector('.option')
        }
        next ? next.className += ' selected' : next = 0
        this.input.value = next ? next.getAttribute('data-val') : this.input.last_val
        this.updateSize(0, next)
        break

      case KEYCODE.UP:
        if (this.isDropdownHidden()) return this.dropdownDisplay('block')
        if (prev) {
          prev.className = 'option'
          next = prev.previousSibling
        } else {
          next = this.dropdown.childNodes[this.dropdown.childNodes.length - 1]
        }
        next ? next.className += ' selected' : next = 0
        this.input.value = next ? next.getAttribute('data-val') : this.input.last_val
        this.updateSize(0, next)
        break

      case KEYCODE.ESCAPE:
        this.input.value = this.input.last_val
        this.dropdownDisplay('none')
        break

      case KEYCODE.ENTER:
        const s = this.dropdown.querySelector('.option.selected')
        if (s && !this.isDropdownHidden()) {
          this.onSelect(e, s.getAttribute('data-val'), s)
          setTimeout(_ => this.dropdownDisplay('none'), 20)
        }
        break

      default:
        break
    }
  }

  source(term, suggest) {
    term = term.toLowerCase()
    const matched = this.options.filter(val => ~val.toLowerCase().indexOf(term))
    this.suggest(matched)
  }

  onSelect(e, term, item) {}

  suggest(data) {
    const val = this.input.value
    this.cache[val] = data
    if (data.length && val.length >= this.minChars) {
      let s = ''
      for (let i = 0; i < data.length; i++) s += this.renderOptions(data[i], val)
      this.dropdown.innerHTML = s
      return this.updateSize(0)
    }
    this.dropdownDisplay('none')
  }

  renderOptions(item, search) {
    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const re = new RegExp(`(${search.split(' ').join('|')})`, 'gi')
    return `<div class="option" data-val="${item}">${item.replace(re, '<b>$1</b>')}</div>`
  }

  updateSize(resize, next) {
    const rect = this.input.getBoundingClientRect()
    this.dropdown.style.left = (rect.left + window.pageXOffset + this.offsetleft) | 0 + 'px'
    this.dropdown.style.top = (rect.bottom + window.pageYOffset + this.offsettop) | 0 + 'px'
    this.dropdown.style.width = (rect.right - rect.left) | 0 + 'px'

    if (resize) return

    this.dropdownDisplay('block')

    if (!this.dropdown.maxHeight)
      this.dropdown.maxHeight = parseInt(getComputedStyle(this.dropdown, null).maxHeight)

    const auto = this.dropdown.querySelector('.option')

    if (!this.dropdown.height && auto) this.dropdown.height = auto.offsetHeight

    if (!next) return this.dropdownrollTop = 0

    const scrTop = this.dropdown.scrollTop
    const selTop = next.getBoundingClientRect().top - this.dropdown.getBoundingClientRect().top
    const greaterThanZero = selTop + this.dropdown.height - this.dropdown.maxHeight > 0

    if (greaterThanZero)
      this.dropdown.scrollTop = selTop + this.dropdown.height + scrTop - this.dropdown.maxHeight
    else if (selTop < 0)
      this.dropdown.scrollTop = selTop + scrTop
  }

  disconnectedCallback() {
    this.dropdown.removeEventListener('mouseleave', this.mouseLeave)
    this.dropdown.removeEventListener('mouseover', this.mouseOver)
    this.dropdown.removeEventListener('mousedown', this.mouseDown)
    this.input.removeEventListener('resize', this.updateSize)
    this.input.removeEventListener('keydown', this.keyDown)
    this.input.removeEventListener('keyup', this.keyUp)
    this.input.removeEventListener('blur', blur)
    this.input.removeEventListener('focus', focus)
    let autocomplete = getTemplate('#autoCompleteTemplate')
    autocomplete = null
  }

}

customElements.define('x-auto-complete', AutoComplete)



