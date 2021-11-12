const url = 'https://mock-api.driven.com.br/api/v4/uol/'
let username;
let userAndStatus = ['Todos', 'message'];
let dataTime = '';

function setUsernameKey(event) {
  if (event.keyCode === 13) {
    setUsername()
  }
}

function setUsername() {
  username = document.querySelector('.login input').value;

  document.querySelector('.login div').innerHTML = `<img src="assets/img/loading.gif" />`

  setTimeout(() => {
    document.querySelector('.login').classList.add('dn');

    login();
  }, 2000);
}

function nav_bar() {
  document.querySelector('nav').classList.toggle('dn');
  document.body.classList.toggle('oh');
}

function selected(element) {
  let selectedExists = element.parentNode.querySelector('.icon-confirm');

  if (selectedExists) {
    selectedExists.remove()
  }

  element.querySelector('span').innerHTML = `<ion-icon name="checkmark-sharp" class="icon-confirm"></ion-icon>`;

  let ulArray = element.parentNode.parentNode.querySelectorAll('ul');

  for (let i = 0; i < ulArray.length; i++) {
    userAndStatus[i] = ulArray[i].querySelector('.icon-confirm').parentNode.parentNode.querySelector('div h1').innerHTML;
  }

  let msgInput = document.querySelector('footer span');
  msgInput.innerHTML = `Enviando para ${userAndStatus[0]} (${userAndStatus[1]})`;

  if (ulArray[1]) {
    if (ulArray[1].querySelector('.icon-confirm').parentNode.parentNode.querySelector('div h1').innerHTML == 'Público') {
      userAndStatus[1] = 'message'
    } else {
      userAndStatus[1] = 'private_message'
    }
  }
}

function login() {
  let promise = axios.post(`${url}participants`, { name: username })

  promise.then(processResponseName);
  promise.catch(processResponseNameCatch);
}

function processResponseName(promise) {
  if (promise.status === 200) {
    start()
  } else {
    window.location.reload()
  }
}

function processResponseNameCatch(error) {
  window.location.reload()
}

function sendMessageKey(event, element) {
  if (event.keyCode === 13) {
    sendMessage(element.parentNode.children[1]);
  }
}

function sendMessage(element) {
  let input = element.parentNode.children[0];
  let message = input.value;
  input.value = "";

  let promise = axios.post(`${url}messages`, {
    from: username,
    to: userAndStatus[0],
    text: message,
    type: userAndStatus[1]
  })

  promise.then(processResponseSendMessage);
  promise.catch(processResponseSendMessageCatch);
}

function processResponseSendMessage(response) {
  console.log(response);

  fetchMessages();
}

function processResponseSendMessageCatch() {
  window.location.reload()
}

function keepConnection() {
  axios.post(`${url}status`, { name: username });
}

function fetchMessages() {
  const promise = axios.get(`${url}messages`);

  promise.then(processResponseMessages)
}

function processResponseMessages(promise) {
  let ul = document.querySelector('ul');
  let data = promise.data;

  if (dataTime != data[data.length - 1].time) {
    let ul = document.querySelector('main ul');
    let lis = ul.querySelectorAll('li');

    if (lis != "") {
      for (let i = 0; i < lis.length; i++) {
        lis[i].remove();
      }
    }

    for (let i = 0; i < data.length; i++) {
      // Se o objeto for do tipo status adiciona li com a class 'chat-info'
      if (data[i].type === 'status') {
        ul.innerHTML += `<li class="chat chat-info" data-identifier="message"><span>(${data[i].time})</span>
        <span><strong>${data[i].from}</strong></span><span>${data[i].text}</span></li>`

        // Se o objeto for do tipo private_message adiciona li com a class 'chat-reserved'
      } else if (data[i].type === 'private_message') {
        // So mostra se a mensagem privada for para o usuario logado
        if (data[i].to == username || data[i].to == 'Todos' || data[i].from == username) {
          ul.innerHTML += `<li class="chat chat-reserved" data-identifier="message"><span>(${data[i].time})</span>
          <span><strong>${data[i].from} </strong>reservadamente para <strong>${data[i].to}</strong>:</span>
          <span>${data[i].text}</span></li>`
        }

        // Se o objeto for do tipo message adiciona li com a class 'chat-all'
      } else {
        ul.innerHTML += `<li class="chat" data-identifier="message"><span>(${data[i].time})</span>
        <span><strong>${data[i].from} </strong>para <strong>${data[i].to}</strong>:</span>
        <span>${data[i].text}</span></li>`
      }
    }

    dataTime = data[data.length - 1].time;

    let lastLi = document.querySelector('ul .chat:last-child');
    lastLi.scrollIntoView();
  }

  totalMessages = data.length;
}

function getUsers() {
  let promisse = axios.get('http://mock-api.driven.com.br/api/v4/uol/participants');

  promisse.then(processResponseGetUsers);
}

function processResponseGetUsers(response) {
  let ul = document.querySelector('nav ul');
  let users = response.data;
  let userSelected = document.querySelector('nav ul .icon-confirm').parentNode.parentNode;
  let keepUserSelected;
  let liArray = ul.querySelectorAll('li');

  if (liArray.length > 1) {
    for (let i = 1; i < liArray.length; i++) {
      if (userSelected.children[0].innerHTML == liArray[i].children[0].innerHTML) {
        keepUserSelected = liArray[i].children[0].children[1].innerHTML;
      }
      liArray[i].remove();
    }
  }

  for (let i = 0; i < users.length; i++) {
    if (keepUserSelected == users[i].name) {
      ul.innerHTML += userSelected.outerHTML;
    } else {
      ul.innerHTML += `<li onclick="selected(this)" data-identifier="participant">
      <div>
        <ion-icon name="person-circle" class="icon-nav"></ion-icon>
        <h1>${users[i].name}</h1>
      </div>
      <span></span>
    </li>`;
    }
  }
}

function start() {
  fetchMessages();
  keepConnection();
  getUsers();

  setInterval(fetchMessages, 3000);
  setInterval(keepConnection, 5000);
  setInterval(getUsers, 10000);
}
