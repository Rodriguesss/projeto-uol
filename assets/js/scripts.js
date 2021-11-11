const url = 'https://mock-api.driven.com.br/api/v4/uol/'
let username = prompt('Insira seu nickname:')
let userAndStatus = ['Todos', 'message'];
let dataTime = '';

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
    userAndStatus[i] = ulArray[i].querySelector('.icon-confirm').parentNode.parentNode.querySelector('div div').innerHTML;
  }

  if (ulArray[1]) {
    if (ulArray[1].querySelector('.icon-confirm').parentNode.parentNode.querySelector('div div').innerHTML == 'Público') {
      userAndStatus[1] = 'message'
    } else {
      userAndStatus[1] = 'private_message'
    }
  }
}

function registerUsername(name) {
  let promise = axios.post(`${url}participants`, { name })

  promise.then(processResponseName);
  promise.catch(processResponseNameCatch);
}

function processResponseName(promise) {
  if (promise.status === 200) {
    start()
  } else {
    username = prompt('Desculpe este nome já esta em uso! Digite outro:')

    registerUsername(username);
  }
}

function processResponseNameCatch(error) {
  alert(error);
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

function start() {
  fetchMessages();
  keepConnection();

  setInterval(fetchMessages, 3000);
  setInterval(keepConnection, 5000);
}

registerUsername(username);
