const GITHUB = 'https://api.github.com';
const USER_NAME = 'Microsoft';
const ISSUE_COUNT = 10

let currentPage = 1;
let perPage = ko.observable(10);
const reposLength = ko.observable(0);

let items = ko.observableArray([]);
let issue = ko.observableArray([]);
ko.applyBindings(items, document.querySelector('.main'));
ko.applyBindings(issue, document.querySelector('.modal'));

const loadingMessage = document.querySelector('.loading');
const errorMessage = document.querySelector('.error')


fetch(`${GITHUB}/users/${USER_NAME}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных, попробуйте позже');
    }
    return response.json();
  })
  .then(data => {
    reposLength(data.public_repos);
    errorMessage.innerHTML = ''
  })
  .catch(error => {
    errorMessage.innerHTML = error
    console.error('Ошибка при загрузке данных:', error);
  }).finally(() => loadingMessage.style.display = 'none')


function getRepositories(page = 1, perPage = 10) {
  const PARAMS = {
    page: page.toString(),
    per_page: perPage.toString(),
  }

  const URL = `${GITHUB}/users/${USER_NAME}/repos?${new URLSearchParams(PARAMS)}`;

  blockEvents()

  return fetch(URL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных, попробуйте позже')
      }
      return response.json()
    })
    .then(data => {
      items([]);
      items(data);
      errorMessage.innerHTML = ''
    })
    .catch(error => {
      errorMessage.innerHTML = error
      console.error('Ошибка при загрузке данных:', error)
    }).finally(() => {
      updatePagination()
      unBlockEvents()
    })
}


const updatePagination = ko.computed(() => {
  const pagination = document.querySelector('.pagination');

  pagination.innerHTML = '';
  const totalPages = Math.ceil(reposLength() / perPage());

  for (let i = 1; i <= 9; i++) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    span.innerHTML = '...'

    if (i === 3 || i === 8) {
      pagination.appendChild(span);
    }

    button.textContent = i;
    button.classList.add('btn')
    if (i === 8) button.textContent = totalPages - 1;
    if (i === 9) button.textContent = totalPages;

    button.style.display = 'none';
    button.addEventListener('click', function () {
      getRepositories(+this.textContent.trim());
      showButtons(+this.textContent.trim());
    });
    pagination.appendChild(button);
  }

  showButtons(1)
});

getRepositories(perPage());


function showButtons(currentPage) {
  const pagination = document.querySelector('.pagination');
  const paginationButtons = pagination.querySelectorAll('button');
  const paginationSpans = pagination.querySelectorAll('span');
  let length = paginationButtons.length

  const lastPage = Math.ceil(reposLength() / perPage())

  for (let i = 0; i < length; i++) {
    paginationButtons[i].style.display = 'none'

    if (i === 0 && lastPage > 0) paginationButtons[i].style.display = 'inline-block'
    if (i === 1 && lastPage > 1) paginationButtons[i].style.display = 'inline-block'
    if (i === length - 1 && lastPage > 2) paginationButtons[i].style.display = 'inline-block'
    if (i === length - 2 && lastPage > 3) paginationButtons[i].style.display = 'inline-block'
  }

  if (currentPage - 4 > 0) {
    paginationButtons[2].style.display = 'inline-block'
    let count = 0
    if (currentPage === lastPage) count = 1
    paginationButtons[2].innerHTML = currentPage - 2 - count
  }

  if (currentPage - 3 > 0) {
    let count = 0
    if (currentPage === lastPage) count = 1
    paginationButtons[3].style.display = 'inline-block'
    paginationButtons[3].innerHTML = currentPage - 1 - count
  }

  if (currentPage - 1 > 0 && currentPage < lastPage - 1) {
    paginationButtons[4].style.display = 'inline-block'
    let count = 0
    if (currentPage === 2) count = 1
    paginationButtons[4].innerHTML = currentPage + count
  }

  if (currentPage + 1 < lastPage - 4) {
    paginationButtons[5].style.display = 'inline-block'
    let count = 0
    if (currentPage === 1 || currentPage === 2) count = 1
    paginationButtons[5].innerHTML = currentPage + 1 + count
  }

  if (currentPage + 2 < lastPage - 3) {
    paginationButtons[6].style.display = 'inline-block'
    let count = 0
    if (currentPage === 1 || currentPage === 2) count = 1
    paginationButtons[6].innerHTML = currentPage + 2 + count
  }

  paginationSpans[0].style.display = currentPage <= 5 ? 'none' : 'inline-block'
  paginationSpans[1].style.display = currentPage >= lastPage - 5 ? 'none' : 'inline-block'
}


(() => {
  const showCountButtons = document.querySelectorAll('.show-count button')
  if (showCountButtons.length > 0) {
    for (const btn of showCountButtons) {
      btn.addEventListener('click', function () {
        perPage(+btn.innerHTML.trim())
        getRepositories(1, +btn.innerHTML.trim());
        showButtons(1)
      })
    }
  }
})()


function dateShow(date) {
  const date1 = new Date(date)
  return `${date1.getDate()}.${date1.getMonth() + 1}.${date1.getFullYear()} ${date1.getHours()}:${date1.getMinutes()}`
}

function dateShowIssue(date) {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  const date1 = new Date(date)
  return `${date1.getHours()}:${date1.getMinutes()} ${date1.getDate()}.${months[date1.getMonth()]}.${date1.getFullYear()}`
}


function openModal() {
  const modal = document.querySelector('.modal')
  modal.classList.add('active')
}

const overlay = document.querySelector('.modal__overlay')
const modalCloseBtn = document.querySelector('.modal__close-btn')
overlay.addEventListener('click', closeModal)
modalCloseBtn.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})

function closeModal() {
  const modal = document.querySelector('.modal')
  modal.classList.remove('active')
}


function getLatestIssues(REPO_NAME) {
  const url = `${GITHUB}/repos/${USER_NAME}/${REPO_NAME}/issues?per_page=${ISSUE_COUNT}`;
  blockEvents()
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      return response.json();
    })
    .then(data => {
      issue([]);
      issue(data);
      openModal()
    })
    .catch(error => {
      console.error('Ошибка при получении issue:', error);
    }).finally(() => unBlockEvents())
}

document.addEventListener('dblclick', function (e) {
  if (e.target.classList.contains('table__td')) {
    const name = e.target.parentNode.querySelectorAll('.table__td')[0]
    if (name) {
      getLatestIssues(name.textContent.trim())
    }
  }
}) 


function stopEvent(e) {
  e.stopPropagation();
  e.preventDefault();
}
function blockEvents() {
  document.addEventListener("click", stopEvent, true)
  document.querySelectorAll('a, button', '.table__td').forEach(function(el) {
    el.classList.add('blocked')
  });
}
function unBlockEvents() {
  document.removeEventListener("click", stopEvent, true);
  document.querySelectorAll('a, button, .table__td').forEach(function(el) {
    el.classList.remove('blocked')
  });
}

