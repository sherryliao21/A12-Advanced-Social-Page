const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'
const dataPanel = document.querySelector('#data-panel')
const users = JSON.parse(localStorage.getItem('FavoriteUsers'))
let filteredUserList = []
// search bar
const searchSubmit = document.querySelector('#search-submit')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
// pagination
const USERS_PER_PAGE = 18
const paginator = document.querySelector('#paginator')

// Render Page
renderPaginator(users.length)
renderUserList(getUsersByPage(1))

// Paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // prevent from clicking on other things
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  renderUserList(getUsersByPage(page))
})


// Show Modal Info or Remove User From List
dataPanel.addEventListener('click', function OnPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    showModalInfo(Number(event.target.dataset.id))
  } else if (event.target.matches('#remove-from-favorite-button')) {
    removeFromList(Number(event.target.dataset.id))
  }
})

// Functions
function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return users.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function removeFromList(id) {
  // if favorite list is empty, end function
  if (!users) return
  const userIndex = users.findIndex((user) => user.id === id)
  // if cannot find said user, end function
  if (userIndex === -1) return
  // remove said user from list
  users.splice(userIndex, 1)
  // set item in browser local storage
  localStorage.setItem('FavoriteUsers', JSON.stringify(users))
  // render new list from local storage
  renderUserList(getUsersByPage(1))
  renderPaginator(users.length)
}

function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-2 mt-3" id="user-card">
        <div class="card">
          <img src="${item.avatar}" class="card-img-top"
          alt="user-profile-picture" id="user-profile-picture" data-bs-toggle="modal" data-bs-target="#UserModal" data-id = ${item.id}>
        </div>
        <div class="card-body">
          <p class="card-text" id="user-profile-name">${item.name + ' ' + item.surname}</p>
          <button type="button" class="btn btn-danger" id="remove-from-favorite-button" data-id = ${item.id}>x</button>
        </div>
      </div>
    </div>
  </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

function showModalInfo(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalDescription = document.querySelector('#user-modal-description')
  const modalImage = document.querySelector('#user-modal-image')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      modalTitle.innerHTML = `<strong>${data.name + ' ' + data.surname}</strong>`
      modalDescription.innerHTML = `
      <p>
      <strong>Gender:</strong> ${data.gender} </br>
      <strong>Age:</strong> ${data.age} </br>
      <strong>Email:</strong> ${data.email} </br>  
      <strong>Region:</strong> ${data.region} </br>  
      <strong>Birthday:</strong> ${data.birthday} </br>
      </p>
      `
      modalImage.innerHTML = `<img src="${data.avatar}" id="user-modal-image"
        alt="user-profile-picture">
        `
    })
    .catch((error) => {
      console.log(error)
    })
}