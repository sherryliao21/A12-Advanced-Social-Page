// urls
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'
// render
const dataPanel = document.querySelector('#data-panel')
const users = []
let filteredUserList = []
// search bar
const searchSubmit = document.querySelector('#search-submit')
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
// pagination
const USERS_PER_PAGE = 18
const paginator = document.querySelector('#paginator')
// loader
const loader = document.querySelector('#loader')

// Render User List
axios
  .get(INDEX_URL)
  .then((response) => {
    loading()
    // use ... to push data sets into users, or else users.length would be 1
    users.push(...response.data.results)
    renderPaginator(users.length)
    // display page 1 by default
    renderUserList(getUsersByPage(1, users))
    complete()
  })
  .catch((error) => {
    console.log(error)
  })

// Paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // prevent from clicking on other things
  if (event.target.tagName !== 'A') return
  const page = event.target.dataset.page
  if (!filteredUserList.length) {
    renderUserList(getUsersByPage(page, users))
  } else {
    renderUserList(getUsersByPage(page, filteredUserList))
  }
})

// Search bar
// searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
//   event.preventDefault()
//   // get value from search input
//   const keyword = searchInput.value.trim().toLowerCase()
//   // find match between keyword & user name
//   if (!keyword) {
//     return alert('Input cannot be empty!')
//   }
//   // create a new list with filtered data
//   filteredUserList = users.filter((user) =>
//     user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
//   )
//   // warn if no matching data
//   if (filteredUserList.length === 0) {
//     alert('No matching users!')
//     renderPaginator(users.length)
//     renderUserList(getUsersByPage(1, users))
//     return searchInput.value = ''
//   }
//   // render filtered list (search result)
//   renderPaginator(filteredUserList.length)
//   renderUserList(getUsersByPage(1, filteredUserList))
// })

searchInput.addEventListener('keyup', function syncRenderingBySearchResult(event) {
  const keyword = searchInput.value.trim().toLowerCase()
  // find match between keyword & user name
  if (!keyword) {
    return renderUserList(getUsersByPage(1, users))
  }
  // create a new list with filtered data
  filteredUserList = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  // warn if no matching data
  if (filteredUserList.length === 0) {
    alert('No matching users!')
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1, users))
    return searchInput.value = ''
  }
  renderPaginator(filteredUserList.length)
  renderUserList(getUsersByPage(1, filteredUserList))
})

// Buttons
dataPanel.addEventListener('click', function OnPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    showModalInfo(event.target.dataset.id)
  } else if (event.target.matches('#add-to-favorite')) {
    addToFavorite(Number(event.target.dataset.id))

  } else if (event.target.matches('#add-to-block')) {
    addToBlock(Number(event.target.dataset.id))
  }
})

// Functions_loading
function loading() {
  loader.hidden = false
  dataPanel.hidden = true
}

function complete() {
  if (!loader.hidden) {
    dataPanel.hidden = false
    loader.hidden = true
  }
}

// Functions_render
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
          <div class="buttons">
            <button type="button" class="btn btn-success" id="add-to-favorite" data-id = "${item.id}">Add</button>
            <button type="button" class="btn btn-danger" id="add-to-block" data-id = "${item.id}">Block</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

function getUsersByPage(page, list) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return list.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// Functions_buttons
function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem('FavoriteUsers')) || []
  const matchedUserInfo = users.find((user) => user.id === id)
  // prevent repetition
  if (favoriteList.some((user) => user.id === id)) {
    return alert('This user is already in your favorite list!')
  }
  favoriteList.push(matchedUserInfo)
  localStorage.setItem('FavoriteUsers', JSON.stringify(favoriteList))
}

function addToBlock(id) {
  const blockedList = JSON.parse(localStorage.getItem('BlockedUsers')) || []
  const matchedUserInfo = users.find((user) => user.id === id)
  // prevent repetition
  if (blockedList.some((user) => user.id === id)) {
    return alert('This user is already in your block list!')
  }
  blockedList.push(matchedUserInfo)
  localStorage.setItem('BlockedUsers', JSON.stringify(blockedList))
}

// Function_modal
function showModalInfo(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalDescription = document.querySelector('#user-modal-description')
  const modalImage = document.querySelector('#user-modal-image')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      loading()
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
      complete()
    })
    .catch((error) => {
      console.log(error)
    })
}