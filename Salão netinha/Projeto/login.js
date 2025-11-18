// Mostra o formulário de cadastro
function mostrarCadastro() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("cadastroForm").style.display = "block";
  document.getElementById("formTitle").innerText = "Cadastro";
}

// Mostra o formulário de login
function mostrarLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("cadastroForm").style.display = "none";
  document.getElementById("formTitle").innerText = "Login";
}

// Função de cadastro
function cadastrar() {
  const nome = document.getElementById('nomeCadastro').value.trim();
  const email = document.getElementById('emailCadastro').value.trim();
  const senha = document.getElementById('senhaCadastro').value.trim();
  const tipo = document.getElementById('tipoUsuario').value;
  
  // Validação básica
  if (!nome || !email || !senha) {
    alert("Por favor, preencha todos os campos para se cadastrar!");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  // Verifica se o e-mail já foi cadastrado
  if (usuarios.find(u => u.email === email)) {
    alert("Este e-mail já está cadastrado! Faça login ou use outro endereço.");
    return;
  }

  // Adiciona o novo usuário
  usuarios.push({ nome, email, senha, tipo });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert("✨ Cadastro realizado com sucesso! Agora faça login para continuar.");
  mostrarLogin();
}

// Função de login
function login() {
  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value.trim();

  if (!email || !senha) {
    alert("Digite seu e-mail e senha para entrar.");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (user) {
    localStorage.setItem('usuarioLogado', JSON.stringify(user));
    alert(`Bem-vindo(a), ${user.nome}! 💖`);
    
    // Redirecionamento conforme tipo
    if (user.tipo === "admin") {
      window.location.href = "index.html";
    } else {
      window.location.href = "index.html";
    }
  } else {
    alert("❌ Usuário ou senha inválidos. Tente novamente.");
  }
}

// Login com Google
function handleCredentialResponse(response) {
  console.log("Credencial do Google:", response.credential);
  const user = parseJwt(response.credential);
  
  localStorage.setItem('usuarioLogado', JSON.stringify({
    nome: user.name,
    email: user.email,
    tipo: "cliente",
    google: true
  }));

  alert(`💅 Login com Google bem-sucedido! Seja bem-vinda, ${user.name}.`);
  window.location.href = "index.html";
}

// Decodifica o token JWT do Google
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}
