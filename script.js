document.addEventListener('DOMContentLoaded', () => {
  loadFormData();
  document.getElementById('textTemplateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generateCode();
  });

  // Configurar o alternador de tema
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', toggleTheme);

  // Verificar e aplicar o tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
  }

  // Adicionar event listener para o botão de envio da requisição API
  const sendApiRequestButton = document.getElementById('sendApiRequest');
  if (sendApiRequestButton) {
    sendApiRequestButton.addEventListener('click', sendApiRequest);
  } else {
    console.error('Botão de envio da requisição API não encontrado');
  }

  // Adicionar event listener para o campo de URL do API tester
  const apiUrlInput = document.getElementById('apiUrl');
  if (apiUrlInput) {
    apiUrlInput.addEventListener('paste', handleCurlPaste);
  }

  // Carregar o token salvo
  const savedToken = localStorage.getItem('apiToken');
  if (savedToken) {
    document.getElementById('apiToken').value = savedToken;
    document.getElementById('authToken').value = savedToken;
  }

  // Adicionar event listener para o Code Snippet
  const codeSnippetTextarea = document.getElementById('codeSnippet');
  if (codeSnippetTextarea) {
    codeSnippetTextarea.addEventListener('input', updateFromCodeSnippet);
  }

  // Adicionar event listener para o botão de atualização do Code Snippet
  const updateFromSnippetButton = document.getElementById('updateFromSnippet');
  if (updateFromSnippetButton) {
    updateFromSnippetButton.addEventListener('click', updateFromCodeSnippet);
  }

  // Adicionar event listener para o botão de copiar resposta da API
  const copyApiResponseButton = document.getElementById('copyApiResponse');
  if (copyApiResponseButton) {
    copyApiResponseButton.addEventListener('click', copyApiResponse);
  }
});

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const themeIcon = document.querySelector('#themeToggle i');
  if (document.body.classList.contains('dark-theme')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    localStorage.setItem('theme', 'light');
  }
}

function updateParameterFields() {
  const paramCount = parseInt(document.getElementById('paramCount').value);
  const container = document.getElementById('parametros-container');
  container.innerHTML = ''; // Limpar os campos existentes

  for (let i = 0; i < paramCount; i++) {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `param${i}`;
    input.name = `param${i}`;
    input.required = true;

    const label = document.createElement('label');
    label.htmlFor = `param${i}`;
    label.textContent = `Texto do Parâmetro ${i + 1}`;

    inputGroup.appendChild(input);
    inputGroup.appendChild(label);
    container.appendChild(inputGroup);
  }

  // Recarregar valores dos parâmetros
  const params = JSON.parse(localStorage.getItem('parameters')) || [];
  params.forEach((param, index) => {
    if (index < paramCount) {
      document.querySelector(`input[name='param${index}']`).value = param.text;
    }
  });
}

function generateCode() {
  let url = document.getElementById('url').value;
  const authToken = document.getElementById('authToken').value;
  const number = document.getElementById('number').value;
  const serviceId = document.getElementById('serviceId').value;
  const hsmId = document.getElementById('hsmId').value;
  const paramCount = parseInt(document.getElementById('paramCount').value);
  const language = document.getElementById('languageSelect').value;

  // Verificar se a URL começa com "https://"
  if (!url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const parameters = [];
  for (let i = 0; i < paramCount; i++) {
    const paramText = document.querySelector(`input[name='param${i}']`).value;
    parameters.push({
      type: 'text',
      text: paramText || ''
    });
  }

  const body = {
    type: "chat",
    number: number,
    serviceId: serviceId,
    hsmId: hsmId,
    files: [],
    uploadingFiles: false,
    replyTo: null,
    parameters: [
      {
        type: "body",
        parameters: parameters
      }
    ],
    file: {}
  };

  let code = '';

  switch (language) {
    case 'curl':
      code = generateCurlCode(url, authToken, body);
      break;
    case 'python':
      code = generatePythonCode(url, authToken, body);
      break;
    case 'javascript':
      code = generateJavaScriptCode(url, authToken, body);
      break;
    case 'php':
      code = generatePhpCode(url, authToken, body);
      break;
  }

  const codeOutput = document.getElementById('codeOutput');
  codeOutput.innerHTML = ''; // Limpar o conteúdo anterior

  const pre = document.createElement('pre');
  const codeElement = document.createElement('code');
  codeElement.className = `language-${language}`;
  codeElement.textContent = code;
  pre.appendChild(codeElement);
  codeOutput.appendChild(pre);

  document.getElementById('codeSnippet').value = code;

  // Salvar dados no localStorage
  localStorage.setItem('url', url);
  localStorage.setItem('authToken', authToken);
  localStorage.setItem('number', number);
  localStorage.setItem('serviceId', serviceId);
  localStorage.setItem('hsmId', hsmId);
  localStorage.setItem('paramCount', paramCount);
  localStorage.setItem('parameters', JSON.stringify(parameters));

  showNotification('Código gerado com sucesso!', 'success');

  // Se você estiver usando uma biblioteca de highlight de sintaxe como Prism.js, você pode chamar a função de highlight aqui
  // Por exemplo: Prism.highlightElement(codeElement);
}


function generateCurlCode(url, authToken, body) {
  return `curl --location -g '${url}/api/v1/messages' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer ${authToken}' \\
--data '${JSON.stringify(body, null, 2)}'`;
}

function generatePythonCode(url, authToken, body) {
  return `import requests
import json

url = "${url}/api/v1/messages"

payload = json.dumps(${JSON.stringify(body, null, 2)})
headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${authToken}'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)`;
}

function generateJavaScriptCode(url, authToken, body) {
  return `var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", "Bearer ${authToken}");

var raw = JSON.stringify(${JSON.stringify(body, null, 2)});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("${url}/api/v1/messages", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));`;
}

function generatePhpCode(url, authToken, body) {
  return `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${url}/api/v1/messages',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => '${JSON.stringify(body)}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'Authorization: Bearer ${authToken}'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;`;
}

function copyToClipboard() {
  const output = document.getElementById('codeOutput');
  navigator.clipboard.writeText(output.textContent).then(() => {
    showNotification('Código copiado para a área de transferência!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar o código: ', err);
    showNotification('Erro ao copiar o código', 'error');
  });
}

function loadFormData() {
  const url = localStorage.getItem('url') || '';
  const authToken = localStorage.getItem('authToken') || '';
  const number = localStorage.getItem('number') || '';
  const serviceId = localStorage.getItem('serviceId') || '';
  const hsmId = localStorage.getItem('hsmId') || '';
  const paramCount = localStorage.getItem('paramCount') || 0;

  document.getElementById('url').value = url;
  document.getElementById('authToken').value = authToken;
  document.getElementById('number').value = number;
  document.getElementById('serviceId').value = serviceId;
  document.getElementById('hsmId').value = hsmId;
  document.getElementById('paramCount').value = paramCount;

  // Carregar o token salvo para o campo apiToken também
  document.getElementById('apiToken').value = authToken;

  updateParameterFields();

  // Carregar parâmetros salvos
  const savedParams = JSON.parse(localStorage.getItem('parameters')) || [];
  savedParams.forEach((param, index) => {
    const paramInput = document.querySelector(`input[name='param${index}']`);
    if (paramInput) {
      paramInput.value = param.text;
    }
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function decode() {
  const input = document.getElementById('dencoder');
  input.value = decodeURIComponent(input.value);
}

function encode() {
  const input = document.getElementById('dencoder');
  input.value = encodeURIComponent(input.value);
}

function copyEncoded() {
  const input = document.getElementById('dencoder');
  navigator.clipboard.writeText(input.value).then(() => {
    showNotification('URL copiada para a área de transferência!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar a URL: ', err);
    showNotification('Erro ao copiar a URL', 'error');
  });
}

function sendApiRequest() {
  const url = document.getElementById('apiUrl').value;
  const method = document.getElementById('apiMethod').value;
  const token = document.getElementById('apiToken').value;
  const headers = parseHeaders(document.getElementById('apiHeaders').value);
  const body = document.getElementById('apiBody').value;

  // Salvar o token no localStorage
  localStorage.setItem('apiToken', token);

  headers['Authorization'] = `Bearer ${token}`;

  const startTime = new Date();

  fetch(url, {
    method: method,
    headers: headers,
    body: method !== 'GET' && method !== 'HEAD' ? body : undefined
  })
  .then(response => {
    const endTime = new Date();
    const duration = endTime - startTime;

    // Processar e exibir os headers da resposta
    const responseHeaders = {};
    for (let pair of response.headers.entries()) {
      responseHeaders[pair[0]] = pair[1];
    }
    displayResponseHeaders(responseHeaders);

    // Exibir o status da resposta
    document.getElementById('apiStatus').textContent = `Status: ${response.status} ${response.statusText}`;
    document.getElementById('apiDuration').textContent = `Duração: ${duration}ms`;

    return response.text();
  })
  .then(data => {
    try {
      // Tentar fazer o parse do JSON
      const jsonData = JSON.parse(data);
      document.getElementById('apiResponseBody').textContent = JSON.stringify(jsonData, null, 2);
    } catch (e) {
      // Se não for JSON, exibir como texto simples
      document.getElementById('apiResponseBody').textContent = data;
    }
    document.getElementById('apiResultBox').style.display = 'block';
  })
  .catch(error => {
    console.error('Erro:', error);
    document.getElementById('apiResponseBody').textContent = `Erro: ${error.message}`;
    document.getElementById('apiResultBox').style.display = 'block';
  });
}

function parseHeaders(headersString) {
  const headers = {};
  const lines = headersString.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split(':').map(item => item.trim());
    if (key && value) {
      headers[key] = value;
    }
  });
  return headers;
}

function displayResponseHeaders(headers) {
  const headerContainer = document.getElementById('apiResponseHeaders');
  headerContainer.innerHTML = '';
  for (const [key, value] of Object.entries(headers)) {
    const headerElement = document.createElement('div');
    headerElement.textContent = `${key}: ${value}`;
    headerContainer.appendChild(headerElement);
  }
}

function handleCurlPaste(event) {
  const pastedText = event.clipboardData.getData('text');
  if (pastedText.trim().toLowerCase().startsWith('curl')) {
    event.preventDefault();
    parseCurlCommand(pastedText);
  }
}

function parseCurlCommand(curlCommand) {
  // Expressões regulares para extrair informações do comando cURL
  const urlRegex = /'(https?:\/\/[^']+)'/;
  const headerRegex = /-H '([^:]+): ([^']+)'/g;
  const dataRegex = /--data '(.+)'/s;

  // Extrair URL
  const urlMatch = curlCommand.match(urlRegex);
  if (urlMatch) {
    document.getElementById('apiUrl').value = urlMatch[1];
  }

  // Extrair headers
  const headers = [];
  let headerMatch;
  while ((headerMatch = headerRegex.exec(curlCommand)) !== null) {
    headers.push(`${headerMatch[1]}: ${headerMatch[2]}`);
  }
  document.getElementById('apiHeaders').value = headers.join('\n');

  // Extrair o token de autorização
  const authHeader = headers.find(h => h.toLowerCase().startsWith('authorization:'));
  if (authHeader) {
    const token = authHeader.split(' ')[2];
    document.getElementById('apiToken').value = token;
  }

  // Extrair dados (body)
  const dataMatch = curlCommand.match(dataRegex);
  if (dataMatch) {
    document.getElementById('apiBody').value = dataMatch[1];
  }

  // Definir o método (assumindo POST se houver dados, caso contrário GET)
  document.getElementById('apiMethod').value = dataMatch ? 'POST' : 'GET';

  // Atualizar o campo de Code Snippet
  document.getElementById('codeSnippet').value = curlCommand;
}

function updateFromCodeSnippet() {
  const snippet = document.getElementById('codeSnippet').value;
  if (snippet.trim().toLowerCase().startsWith('curl')) {
    parseCurlCommand(snippet);
  } else {
    showNotification('O snippet deve ser um comando cURL válido', 'error');
  }
}

function copyApiResponse() {
  const responseBody = document.getElementById('apiResponseBody').textContent;
  navigator.clipboard.writeText(responseBody).then(() => {
    showNotification('Resposta da API copiada para a área de transferência!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar a resposta da API: ', err);
    showNotification('Erro ao copiar a resposta da API', 'error');
  });
}

