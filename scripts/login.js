// API URL
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : window.location.origin;

// cria/garante container de mensagem abaixo do botão dentro do form
function ensureMessageContainer(formId, containerId) {
  if (document.getElementById(containerId)) return;
  const form = document.getElementById(formId);
  if (!form) return;
  const msg = document.createElement('div');
  msg.id = containerId;
  msg.style.marginTop = '10px';
  msg.style.fontSize = '14px';
  msg.style.display = 'none';
  form.appendChild(msg);
}

// mostra mensagem em um dos formulários ('login' ou 'cadastro')
function showFormMessage(formType, message, isError = true, autoHide = 0) {
  const formId = formType === 'login' ? 'loginForm' : 'cadastroForm';
  const containerId = formType === 'login' ? 'loginMessage' : 'cadastroMessage';
  ensureMessageContainer(formId, containerId);
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerText = message;
  el.style.color = isError ? '#c00' : '#0a0';
  el.style.display = 'block';
  if (autoHide > 0) {
    setTimeout(() => {
      el.style.display = 'none';
    }, autoHide);
  }
}

function hideFormMessage(formType) {
  const containerId = formType === 'login' ? 'loginMessage' : 'cadastroMessage';
  const el = document.getElementById(containerId);
  if (el) el.style.display = 'none';
}

function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("cadastroForm").style.display = "block";
  document.getElementById("formTitle").innerText = "Cadastro";
  hideFormMessage('login');
  hideFormMessage('cadastro');
}

function mostrarLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("cadastroForm").style.display = "none";
  document.getElementById("formTitle").innerText = "Login";
  hideFormMessage('login');
  hideFormMessage('cadastro');
}

// Função de cadastro com API
async function cadastrar() {
  const nome = document.getElementById('nomeCadastro').value.trim();
  const email = document.getElementById('emailCadastro').value.trim();
  const telefone = document.getElementById('telefoneCadastro').value.trim();
  const senha = document.getElementById('senhaCadastro').value.trim();
  
  if (!nome || !email || !senha) {
    showFormMessage('cadastro', "Por favor, preencha todos os campos obrigatórios.", true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, telefone, senha })
    });

    const data = await response.json();

    if (data.success) {
      showFormMessage('cadastro', "Cadastro realizado com sucesso!", false, 1400);
      
      document.getElementById('nomeCadastro').value = '';
      document.getElementById('emailCadastro').value = '';
      document.getElementById('telefoneCadastro').value = '';
      document.getElementById('senhaCadastro').value = '';
      
      setTimeout(() => {
        mostrarLogin();
      }, 1400);
    } else {
      showFormMessage('cadastro', data.error || "Erro ao cadastrar.", true);
    }
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    showFormMessage('cadastro', "Erro ao conectar ao servidor.", true);
  }
}

// Função de login com API
document.getElementById('loginButton')?.addEventListener('click', login);

async function login() {
  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();

  if (!email || !senha) {
    showFormMessage('login', "Digite seu e-mail e senha para entrar.", true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (data.success) {
      // Salvar usuário no localStorage
      localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      
      showFormMessage('login', "Login realizado! Redirecionando...", false);
      
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 500);
    } else {
      showFormMessage('login', data.error || "E-mail ou senha incorretos.", true);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    showFormMessage('login', "Erro ao conectar ao servidor.", true);
  }
}
