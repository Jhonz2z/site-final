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

// mostra mensagem em um dos formul�rios ('login' ou 'cadastro')
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

// Atualiza mostrarCadastro / mostrarLogin para limpar mensagens ao alternar
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

   
// Fun��o de cadastro
function cadastrar() {
  const nome = document.getElementById('nomeCadastro').value.trim();
  const email = document.getElementById('emailCadastro').value.trim();
  const telefone = document.getElementById('telefoneCadastro').value.trim();
  const senha = document.getElementById('senhaCadastro').value.trim();
  
  // Valida��o b�sica
  if (!nome || !email || !senha) {
    showFormMessage('cadastro', "Por favor, preencha todos os campos obrigat�rios.", true);
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verifica se o e-mail j� foi cadastrado
  if (usuarios.find(u => u.email === email)) {
    showFormMessage('cadastro', "Este e-mail j� est� cadastrado.", true);
    return;
  }

  // Adiciona o novo usu�rio com telefone
  usuarios.push({ nome, email, telefone, senha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  showFormMessage('cadastro', "Cadastro realizado com sucesso.", false, 1400);

  // Limpa campos e volta para login ap�s timeout
  document.getElementById('nomeCadastro').value = '';
  document.getElementById('emailCadastro').value = '';
  document.getElementById('telefoneCadastro').value = '';
  document.getElementById('senhaCadastro').value = '';
  setTimeout(() => {
    mostrarLogin();
  }, 1400);
}

// Fun��o de login
document.getElementById('loginButton').addEventListener('click', login);

function login() {
  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();

  if (!email || !senha) {
    showFormMessage('login', "Digite seu e-mail e senha para entrar.", true);
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (user) {
    localStorage.setItem('usuarioLogado', JSON.stringify(user));
    showFormMessage('login', "Login realizado. Redirecionando...", false);
    mostrarLogin(); // Redireciona para o login
    window.location.href = '../index.html';
  } else {
    showFormMessage('login', "E-mail ou senha incorretos.", true);
  }
}
