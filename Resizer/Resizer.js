const select = (el, selector) => el.querySelector(selector)

class AddressList {
  constructor(root) {
    this.state = []

    this.form = select(root, 'form')
    this.ul = select(root, 'ul')

    this.input = select(this.form, 'input')
    this.help = select(this.form, '.help')
    console.log(root)

    this.items = {}

    this.onSubmit = this.onSubmit.bind(this)
    this.onClick = this.onClick.bind(this)
    this.init()
  }

  init() {
    this.form.addEventListener('submit', this.onSubmit)
    this.ul.addEventListener('click', this.onClick)
  }

  onSubmit(e) {
    e.preventDefault()
    this.addAddress(this.input.value)
    this.input.value = ''
  }

  onClick(e) {
    const id = e.target.getAttribute('data-delete-id')
    if (!id) return
    this.removeAddress(id)
  }

  addAddress(address) {
    const id = Date.now().toString()
    this.state = this.state.concat({ address, id })

    this.updateHelp()

    const span = document.createElement('span')
    span.innerText = address

    const del = document.createElement('a')
    del.innerText = 'delete'
    del.setAttribute('data-delete-id', id)

    const li = document.createElement('li')
    li.appendChild(del)
    li.appendChild(span)
    this.items[id] = li

    this.ul.appendChild(li)
  }

  removeAddress(id) {
    this.state = this.state.filter(item => item.id != id)
    this.updateHelp()
    this.ul.removeChild(this.items[id])
  }

  updateHelp() {
    const action = this.state.length ? 'add' : 'remove'
    this.help.classList[action]('hidden')
  }
}

new AddressList(document.getElementById('addressList'))


