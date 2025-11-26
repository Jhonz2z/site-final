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
  
  // Botão agendar horário - redireciona para home ou ancora na mesma página
  const sidebarAgendamento = document.getElementById('sidebar-agendamento');
  if (sidebarAgendamento) {
    sidebarAgendamento.addEventListener('click', function(e) {
      e.preventDefault();
      closeMenu();
      
      // Verificar se estamos na página home
      const isHomePage = window.location.pathname.endsWith('index.html') || 
                         window.location.pathname.endsWith('/') ||
                         window.location.pathname.includes('/Projeto/') && !window.location.pathname.includes('/pages/');
      
      if (isHomePage) {
        // Se estamos na home, apenas rola até a seção
        setTimeout(() => {
          const agendamentoSection = document.getElementById('agendamento');
          if (agendamentoSection) {
            agendamentoSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        // Se estamos em outra página, redireciona para home com ancora
        window.location.href = '../index.html#agendamento';
      }
    });
  }
  
  // Botão sair do menu lateral
  const sidebarSair = document.getElementById('sidebar-sair');
  if (sidebarSair) {
    sidebarSair.addEventListener('click', function() {
      if (typeof mostrarConfirm === 'function') {
        mostrarConfirm('Deseja realmente sair?', (confirmed) => {
          if (confirmed) {
            localStorage.removeItem('usuarioLogado');
            window.location.href = '../pages/Login.html';
          }
        });
      } else {
        if (confirm('Deseja realmente sair?')) {
          localStorage.removeItem('usuarioLogado');
          window.location.href = '../pages/Login.html';
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
});
