const url = 'https://mock-api.driven.com.br/api/v4/uol/'
let totalMessages = 0;
let username = prompt('Insira seu nickname:')

function registerUsername(name) {
  let promise = axios.post(`${url}participants`, { name })
  promise.then(processResponseName);
}

function processResponseName(promise) {
  if (promise.status === 200) {
    start()
  } else {
    username = prompt('Desculpe este nome já esta em uso! Digite outro:')

    registerUsername(username);
  }
}

function fetchMessages() {
  const promise = axios.get(`${url}messages`);

  promise.then(processResponseMessages)
}

function processResponseMessages(promise) {
  let ul = document.querySelector('ul');
  let data = promise.data;

  console.log('total: ', data.length)
  console.log('variable: ', totalMessages)

  if (data.length > totalMessages) {
    for (let i = totalMessages; i < data.length; i++) {
      // Se o objeto for do tipo status adiciona li com a class 'chat-info'
      if (data[i].type === 'status') {
        ul.innerHTML += `<li class="chat chat-info"><span>(${data[i].time})</span>
        <span><strong>${data[i].from}</strong></span><span>${data[i].text}</span></li>`

        // Se o objeto for do tipo private_message adiciona li com a class 'chat-reserved'
      } else if (data[i].type === 'private_message') {
        ul.innerHTML += `<li class="chat chat-reserved"><span>(${data[i].time})</span>
        <span><strong>${data[i].from} </strong>reservadamente <strong>${data[i].to}</strong>:</span>
        <span>${data[i].text}</span></li>`

        // Se o objeto for do tipo message adiciona li com a class 'chat-all'
      } else {
        ul.innerHTML += `<li class="chat"><span>(${data[i].time})</span>
        <span><strong>${data[i].from} </strong>para <strong>${data[i].to}</strong>:</span>
        <span>${data[i].text}</span></li>`
      }
    }

    const lastLi = document.querySelector('ul .chat:last-child');
    lastLi.scrollIntoView();
  }

  totalMessages = data.length;
}

function start() {
  fetchMessages()
  setInterval(fetchMessages, 3000);
}

registerUsername(username);
