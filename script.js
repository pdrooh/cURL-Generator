document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    document.getElementById('textTemplateForm').addEventListener('submit', (e) => {
      e.preventDefault();
      generateCurl();
    });
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
  




// Adicione este código ao seu event listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // ... (código existente)

  // Configurar o alternador de tema
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', toggleTheme);

  // Verificar e aplicar o tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
  }
});