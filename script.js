document.addEventListener('DOMContentLoaded', () => {
  loadFormData();
  document.getElementById('textTemplateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generateCurl();
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

function generateCurl() {
  let url = document.getElementById('url').value;
  const authToken = document.getElementById('authToken').value;
  const number = document.getElementById('number').value;
  const serviceId = document.getElementById('serviceId').value;
  const hsmId = document.getElementById('hsmId').value;
  const paramCount = parseInt(document.getElementById('paramCount').value);

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

  const curlCommand = `curl --location -g '${url}/api/v1/messages' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer ${authToken}' \\
--data '{
"type": "chat",
"number": "${number}",
"serviceId": "${serviceId}",
"hsmId": "${hsmId}",
"files": [],
"uploadingFiles": false,
"replyTo": null,
"parameters": [
{
  "type": "body",
  "parameters": ${JSON.stringify(parameters, null, 2)}
}
],
"file": {}
}'`;

  document.getElementById('curlOutput').textContent = curlCommand;
  document.getElementById('codeSnippet').value = curlCommand;

  // Salvar dados no localStorage
  localStorage.setItem('url', url);
  localStorage.setItem('authToken', authToken);
  localStorage.setItem('number', number);
  localStorage.setItem('serviceId', serviceId);
  localStorage.setItem('hsmId', hsmId);
  localStorage.setItem('paramCount', paramCount);
  localStorage.setItem('parameters', JSON.stringify(parameters));

  showNotification('cURL gerado com sucesso!', 'success');
}

function copyToClipboard() {
  const output = document.getElementById('curlOutput');
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

  updateParameterFields();
}

function decode() {
  const input = document.getElementById('dencoder').value;
  try {
    const decoded = decodeURIComponent(input);
    document.getElementById('dencoder').value = decoded;
    showNotification('URL decodificada com sucesso!', 'success');
  } catch (e) {
    showNotification('Erro ao decodificar: ' + e.message, 'error');
  }
}

function encode() {
  const input = document.getElementById('dencoder').value;
  const encoded = encodeURIComponent(input);
  document.getElementById('dencoder').value = encoded;
  showNotification('URL codificada com sucesso!', 'success');
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2700);
  }, 100);
}

function copyEncoded() {
  const encodedText = document.getElementById('dencoder').value;
  navigator.clipboard.writeText(encodedText).then(() => {
    showNotification('URL codificada copiada para a área de transferência!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar a URL codificada: ', err);
    showNotification('Erro ao copiar a URL codificada', 'error');
  });
}

function handleCurlPaste(event) {
  const pastedText = event.clipboardData.getData('text');
  if (pastedText.trim().toLowerCase().startsWith('curl')) {
    event.preventDefault();
    const curlCommand = parseCurlCommand(pastedText);
    document.getElementById('apiUrl').value = curlCommand.url;
    document.getElementById('apiMethod').value = curlCommand.method;
    document.getElementById('apiBody').value = curlCommand.data;
    
    // Preencher o Bearer token
    if (curlCommand.headers['Authorization']) {
      const token = curlCommand.headers['Authorization'].replace('Bearer ', '');
      document.getElementById('apiToken').value = token;
      document.getElementById('authToken').value = token; // Preencher também o campo authToken, se existir
    }

    // Atualizar o textarea do Code Snippet com o comando cURL
    document.getElementById('codeSnippet').value = pastedText;
  }
}

function parseCurl(curlCommand) {
  // URL
  const urlMatch = curlCommand.match(/'(https?:\/\/[^']+)'/);
  if (urlMatch) {
    document.getElementById('apiUrl').value = urlMatch[1];
  }

  // Método
  const methodMatch = curlCommand.match(/-X\s+(\w+)/i);
  if (methodMatch) {
    document.getElementById('apiMethod').value = methodMatch[1].toUpperCase();
  } else if (curlCommand.includes('--data') || curlCommand.includes('-d')) {
    document.getElementById('apiMethod').value = 'POST';
  } else {
    document.getElementById('apiMethod').value = 'GET';
  }

  // Token
  const tokenMatch = curlCommand.match(/-H\s+'Authorization:\s*Bearer\s+([^']+)'/i);
  if (tokenMatch) {
    const token = tokenMatch[1];
    document.getElementById('apiToken').value = token;
    document.getElementById('authToken').value = token; // Atualiza também o campo authToken
    localStorage.setItem('apiToken', token); // Salvar o token
  }

  // Headers
  const headers = curlCommand.match(/-H\s+'([^']+)'/g);
  if (headers) {
    const headerTextarea = document.getElementById('apiHeaders');
    if (headerTextarea) {
      const headerLines = headers
        .map(h => h.match(/-H\s+'(.+)'/)[1])
        .filter(h => !h.toLowerCase().startsWith('authorization:')); // Excluir o header de autorização
      headerTextarea.value = headerLines.join('\n');
    }
  }

  // Body
  const bodyMatch = curlCommand.match(/--data\s+'(.+)'/s) || curlCommand.match(/--data\s+"(.+)"/s);
  if (bodyMatch) {
    const bodyTextarea = document.getElementById('apiBody');
    if (bodyTextarea) {
      try {
        const bodyJson = JSON.parse(bodyMatch[1]);
        bodyTextarea.value = JSON.stringify(bodyJson, null, 2);
      } catch (e) {
        bodyTextarea.value = bodyMatch[1];
      }
    }
  }

  // Atualizar o Code Snippet
  document.getElementById('codeSnippet').value = curlCommand;

  showNotification('Comando cURL analisado com sucesso!', 'success');
}

function updateFromCodeSnippet() {
  const snippetText = document.getElementById('codeSnippet').value;
  if (snippetText.trim().toLowerCase().startsWith('curl')) {
    const curlCommand = parseCurlCommand(snippetText);
    document.getElementById('apiUrl').value = curlCommand.url;
    document.getElementById('apiMethod').value = curlCommand.method;
    document.getElementById('apiBody').value = curlCommand.data;
    
    // Preencher o Bearer token
    if (curlCommand.headers['Authorization']) {
      const token = curlCommand.headers['Authorization'].replace('Bearer ', '');
      document.getElementById('apiToken').value = token;
      document.getElementById('authToken').value = token; // Preencher também o campo authToken, se existir
    }
  }
  
  // Atualizar os campos do formulário principal
  const url = document.getElementById('apiUrl').value;
  const authToken = document.getElementById('apiToken').value;
  
  // Extrair informações do body, se disponível
  const bodyTextarea = document.getElementById('apiBody');
  if (bodyTextarea && bodyTextarea.value) {
    try {
      const bodyJson = JSON.parse(bodyTextarea.value);
      if (bodyJson.number) document.getElementById('number').value = bodyJson.number;
      if (bodyJson.serviceId) document.getElementById('serviceId').value = bodyJson.serviceId;
      if (bodyJson.hsmId) document.getElementById('hsmId').value = bodyJson.hsmId;
      if (bodyJson.parameters && bodyJson.parameters[0] && bodyJson.parameters[0].parameters) {
        const params = bodyJson.parameters[0].parameters;
        document.getElementById('paramCount').value = params.length;
        updateParameterFields();
        params.forEach((param, index) => {
          if (param.text) {
            document.querySelector(`input[name='param${index}']`).value = param.text;
          }
        });
      }
    } catch (e) {
      console.error('Erro ao analisar o corpo JSON:', e);
    }
  }

  // Atualizar os campos principais
  document.getElementById('url').value = url.replace(/\/api\/v1\/messages$/, '');
  document.getElementById('authToken').value = authToken;

  showNotification('Campos atualizados com sucesso!', 'success');
}

function parseCurlCommand(curlCommand) {
  const result = {
    method: 'GET',
    url: '',
    headers: {},
    data: ''
  };

  const parts = curlCommand.split(' ');
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part === '-X' || part === '--request') {
      result.method = parts[++i];
    } else if (part === '-H' || part === '--header') {
      const header = parts[++i].split(':');
      result.headers[header[0].trim()] = header[1].trim();
    } else if (part === '-d' || part === '--data') {
      result.data = parts[++i];
    } else if (!part.startsWith('-')) {
      result.url = part.replace(/['"]/g, '');
    }
  }

  return result;
}

async function sendApiRequest() {
  const url = document.getElementById('apiUrl').value;
  const method = document.getElementById('apiMethod').value;
  const token = document.getElementById('apiToken').value;
  const body = document.getElementById('apiBody').value;

  // Salvar o token atual
  localStorage.setItem('apiToken', token);

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const startTime = new Date();
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined
    });
    const endTime = new Date();
    const duration = endTime - startTime;

    const statusCode = response.status;
    const responseData = await response.text();
    const responseHeaders = Array.from(response.headers.entries());

    // Criar o objeto de resultado
    const result = {
      status: statusCode,
      duration: `${duration}ms`,
      headers: Object.fromEntries(responseHeaders),
      body: tryParseJSON(responseData)
    };

    // Exibir o resultado
    displayApiResult(result);

  } catch (error) {
    displayApiError(error);
  }
}

function displayApiResult(result) {
  const resultBox = document.getElementById('apiResultBox');
  const statusElement = document.getElementById('apiStatus');
  const durationElement = document.getElementById('apiDuration');
  const headersElement = document.getElementById('apiResponseHeaders');
  const bodyElement = document.getElementById('apiResponseBody');

  statusElement.textContent = `Status: ${result.status}`;
  statusElement.className = getStatusClass(result.status);
  
  durationElement.textContent = `Duração: ${result.duration}`;

  headersElement.innerHTML = formatHeaders(result.headers);
  
  bodyElement.innerHTML = typeof result.body === 'object' 
    ? syntaxHighlight(JSON.stringify(result.body, null, 2))
    : escapeHtml(result.body);

  resultBox.style.display = 'block';
}

function displayApiError(error) {
  const resultBox = document.getElementById('apiResultBox');
  const statusElement = document.getElementById('apiStatus');
  const bodyElement = document.getElementById('apiResponseBody');

  statusElement.textContent = 'Erro';
  statusElement.className = 'error';
  bodyElement.textContent = error.message;

  resultBox.style.display = 'block';
}

function getStatusClass(status) {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'redirect';
  if (status >= 400 && status < 500) return 'client-error';
  if (status >= 500) return 'server-error';
  return '';
}

function formatHeaders(headers) {
  return Object.entries(headers)
    .map(([key, value]) => `<strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}`)
    .join('<br>');
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function tryParseJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  }
  catch (e) { }

  return jsonString;
}

function copyApiResponse() {
  const bodyElement = document.getElementById('apiResponseBody');
  const textToCopy = bodyElement.textContent || bodyElement.innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    showNotification('Resposta da API copiada para a área de transferência!', 'success');
  }).catch(err => {
    console.error('Erro ao copiar a resposta da API: ', err);
    showNotification('Erro ao copiar a resposta da API', 'error');
  });
}
