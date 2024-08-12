document.addEventListener('DOMContentLoaded', loadFormData);

function updateParameterFields() {
    const paramCount = parseInt(document.getElementById('paramCount').value);
    const container = document.getElementById('parametros-container');
    container.innerHTML = ''; // Limpar os campos existentes

    for (let i = 0; i < paramCount; i++) {
        const label = document.createElement('label');
        label.textContent = `Texto do Parâmetro ${i + 1}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `param${i}`;
        input.required = true;

        container.appendChild(label);
        container.appendChild(input);
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
    const url = document.getElementById('url').value;
    const authToken = document.getElementById('authToken').value;
    const number = document.getElementById('number').value;
    const serviceId = document.getElementById('serviceId').value;
    const hsmId = document.getElementById('hsmId').value;
    const paramCount = parseInt(document.getElementById('paramCount').value);

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
            "parameters": ${JSON.stringify(parameters, null, 4)}
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
}

function copyToClipboard() {
    const output = document.getElementById('curlOutput');
    navigator.clipboard.writeText(output.textContent).then(() => {
        alert('Código copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar o código: ', err);
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
            "parameters": ${JSON.stringify(parameters, null, 4)}
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
}


// Função para decodificar a URL
function decode() {
    const input = document.getElementById('dencoder').value;
    try {
        const decoded = decodeURIComponent(input);
        document.getElementById('dencoder').value = decoded;
    } catch (e) {
        alert('Erro ao decodificar: ' + e.message);
    }
}

// Função para codificar a URL
function encode() {
    const input = document.getElementById('dencoder').value;
    const encoded = encodeURIComponent(input);
    document.getElementById('dencoder').value = encoded;
}

