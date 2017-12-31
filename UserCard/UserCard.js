const template = document.currentScript.ownerDocument.querySelector('#user-card-template')
const END_POINT = 'https://jsonplaceholder.typicode.com/users'

class UserCard extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', e => this.toggleCard())
    this.details = null
  }

  qs(selector) {
    return this.shadowRoot.querySelector(selector)
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true))

    fetch(`${END_POINT}/${this.getAttribute('user-id')}`)
      .then(res => res.text())
      .then(res => this.render(JSON.parse(res)))
      .catch(err => console.log(err))
  }

  render(userData) {
    this.qs('.card__full-name').innerHTML = userData.name
    this.qs('.card__user-name').innerHTML = userData.username
    this.qs('.card__website').innerHTML = userData.website
    this.qs('.card__address').innerHTML =
      `<h4>Address</h4>
        ${userData.address.suite}, <br />
        ${userData.address.street},<br />
        ${userData.address.city},<br />
        Zipcode: ${userData.address.zipcode}`
    this.details = this.shadowRoot.querySelector('.card__details-btn')
    this.toggleCard()
  }

  toggleCard() {
    const elem = this.qs('.card__hidden-content')
    const btn = this.qs('.card__details-btn')
    elem.style.display == 'none'
      ? (elem.style.display = 'block', btn.innerHTML = 'Less Details')
      : (elem.style.display = 'none', btn.innerHTML = 'More Details')
  }
}

customElements.define('user-card', UserCard)
