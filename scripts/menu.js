// MENU HAMBÚRGUER LATERAL - Compartilhado entre páginas
document.addEventListener('DOMContentLoaded', function() {
  const menuHamburger = document.getElementById('menu-hamburger');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const sidebarClose = document.getElementById('sidebar-close');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  // Abrir menu
  if (menuHamburger) {
    menuHamburger.addEventListener('click', function() {
      menuHamburger.classList.toggle('active');
      sidebarMenu.classList.toggle('active');
      document.body.style.overflow = sidebarMenu.classList.contains('active') ? 'hidden' : '';
    });
  }
  
  // Fechar menu
  function closeMenu() {
    if (menuHamburger) menuHamburger.classList.remove('active');
    if (sidebarMenu) sidebarMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeMenu);
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMenu);
  }
  
  // Botão agendar horário - rola até a seção de agendamento
  const sidebarAgendamento = document.getElementById('sidebar-agendamento');
  if (sidebarAgendamento) {
    sidebarAgendamento.addEventListener('click', function(e) {
      e.preventDefault();
      closeMenu();
      
      // Verificar se estamos na página index.html
      const isIndexPage = window.location.pathname.includes('index.html') || 
                          window.location.pathname.endsWith('/');
      
      if (isIndexPage) {
        // Se estamos na home, apenas rola até a seção
        setTimeout(() => {
          const agendamentoSection = document.getElementById('agendamento');
          if (agendamentoSection) {
            agendamentoSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        // Se estamos em outra página, redireciona para index.html
        window.location.href = 'index.html#agendamento';
      }
    });
  }
  
  // Botão carrinho do menu lateral
  const sidebarCarrinho = document.querySelector('.sidebar-item[onclick="toggleCarrinho()"]');
  if (sidebarCarrinho) {
    // Remover o onclick inline e adicionar event listener
    sidebarCarrinho.removeAttribute('onclick');
    sidebarCarrinho.addEventListener('click', function(e) {
      e.preventDefault();
      closeMenu();
      
      // Aguardar animação de fechamento antes de abrir o carrinho
      setTimeout(() => {
        if (typeof toggleCarrinho === 'function') {
          toggleCarrinho();
        }
      }, 300);
    });
  }
  
  // Botão sair do menu lateral
  const sidebarSair = document.getElementById('sidebar-sair');
  if (sidebarSair) {
    sidebarSair.addEventListener('click', function() {
      // Sempre usar caminho relativo correto
      const loginPath = './Login.html';
      
      if (typeof mostrarConfirm === 'function') {
        mostrarConfirm('Deseja realmente sair?', (confirmed) => {
          if (confirmed) {
            localStorage.removeItem('usuarioLogado');
            window.location.href = loginPath;
          }
        });
      } else {
        if (confirm('Deseja realmente sair?')) {
          localStorage.removeItem('usuarioLogado');
          window.location.href = loginPath;
        }
      }
    });
  }
  
  // Fechar menu ao pressionar ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebarMenu && sidebarMenu.classList.contains('active')) {
      closeMenu();
    }
  });
  
  // Atualizar contador do carrinho no sidebar
  const sidebarCartCount = document.getElementById('sidebar-cart-count');
  function atualizarSidebarCartCount() {
    if (sidebarCartCount) {
      const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
      sidebarCartCount.textContent = carrinho.length;
    }
  }
  
  atualizarSidebarCartCount();
  
  // Atualizar quando o carrinho mudar
  window.addEventListener('storage', atualizarSidebarCartCount);
  
  // Expor função globalmente para ser chamada por script.js
  window.atualizarSidebarCartCount = atualizarSidebarCartCount;
});
