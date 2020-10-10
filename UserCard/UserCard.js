const cardTemplate = document.createElement('template')
cardTemplate.innerHTML = `
  <link rel="stylesheet" href="./UserCard.css">

  <div class="container">
    <div class="header">
      <span class="fullname"></span> (
      <span class="username"></span> )
    <div class="header-subtext">Website: <a class="website"></a></div>
    </div>
    <div class="hidden-content">
      <div class="content"></div>
    </div>
    <button class="show">More Details</button>
  </div>
`
const END_POINT = 'https://jsonplaceholder.typicode.com/users'

class UserCard extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', e => this.toggleCard())
    this.showDetails = null
  }

  qs(selector) {
    return this.shadowRoot.querySelector(selector)
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(cardTemplate.content.cloneNode(true))

    fetch(`${END_POINT}/${this.getAttribute('user-id')}`)
      .then(res => res.text())
      .then(res => this.render(JSON.parse(res)))
      .catch(err => console.log(err))
  }

  render(userData) {
    this.qs('.fullname').innerHTML = userData.name
    this.qs('.username').innerHTML = userData.username
    this.qs('.website').innerHTML = userData.website
    this.qs('.content').innerHTML =
      `<div class="content-header">Address</div>
        ${userData.address.suite}, <br />
        ${userData.address.street},<br />
        ${userData.address.city},<br />
        Zipcode: ${userData.address.zipcode}`
    this.showDetails = this.shadowRoot.querySelector('.show')
    this.toggleCard()
  }

  toggleCard() {
    const elem = this.qs('.hidden-content')
    const btn = this.qs('.show')
    elem.style.display == 'none'
      ? (elem.style.display = 'block', btn.innerHTML = 'Less Details')
      : (elem.style.display = 'none', btn.innerHTML = 'More Details')
  }
}

customElements.define('x-user-card', UserCard)
