// ========================================
// COMPONENTS.JS - Header + Footer + Helpers
// ========================================

/**
 * Carga el contenido del header en el div #header-container
 */
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  // Header limpio (sin íconos en las opciones) y con botón alineado a la derecha
  const headerHTML = `
  <header class="main-header fixed-top">
    <div class="container-fluid">
      <div class="row align-items-center header-content g-0">
        <!-- LOGO -->
        <div class="col-lg-3 col-md-4 col-6">
          <div class="logo-container">
            <a href="home.html" class="d-flex align-items-center">
              <!-- PNG sin fondo -->
              <img src="/img/Circulo.png" alt="Emplanorte" class="logo-img">
              <span class="logo-text ms-2">EMPLANORTE</span>
            </a>
          </div>
        </div>

        <!-- NAV DESKTOP -->
        <div class="col-lg-6 d-none d-md-block">
          <nav class="main-nav">
            <ul class="nav-list d-flex justify-content-center align-items-center mb-0">
              <li class="nav-item"><a href="home.html" class="nav-link" id="nav-home">Inicio</a></li>
              <li class="nav-item"><a href="/nosotros" class="nav-link" id="nav-nosotros">Nosotros</a></li>
              <li class="nav-item"><a href="/contactanos" class="nav-link" id="nav-contactanos">Contáctanos</a></li>
            </ul>
          </nav>
        </div>

        <!-- CTA + TOGGLE (alineado a la derecha) -->
        <div class="col-lg-3 col-md-8 col-6">
          <div class="d-flex justify-content-end align-items-center gap-2">
            <a href="/login" class="btn btn-header-login" id="btnHeaderLogin">
              <span>Iniciar Sesión</span>
            </a>
            <button class="btn d-md-none" id="mobile-menu-btn" aria-label="Abrir menú">
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MENÚ MÓVIL -->
    <div class="mobile-menu" id="mobile-menu">
      <ul class="mobile-nav-list">
        <li><a href="home.html" id="mobile-nav-home">Inicio</a></li>
        <li><a href="/nosotros" id="mobile-nav-nosotros">Nosotros</a></li>
        <li><a href="/contactanos" id="mobile-nav-contactanos">Contáctanos</a></li>
      </ul>
    </div>
  </header>
  `;

  headerContainer.innerHTML = headerHTML;
}

/**
 * Carga el contenido del footer en el div #footer-container
 */
function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  const footerHTML = `
  <footer class="main-footer">
    <div class="container">
      <div class="row footer-widgets">
        <div class="col-lg-4 col-md-6 mb-4 footer-about">
          <div class="logo-container mb-3">
            <img src="/img/logo_nombre.jpeg" alt="Emplanorte Logo" class="footer-logo">
            <span class="logo-text">Emplanorte</span>
          </div>
          <p class="footer-description">
            Empresa cucuteña líder en la fabricación y comercialización de productos plásticos para la industria y el hogar.
          </p>
          <div class="social-links mt-3">
            <a href="#" class="social-link" target="_blank" title="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/emplanortesas" class="social-link" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://wa.me/573005224818" class="social-link" target="_blank" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
            <a href="#" class="social-link" target="_blank" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          </div>
        </div>

        <div class="col-lg-4 col-md-6 mb-4 footer-links">
          <h4 class="footer-title">Navegación</h4>
          <ul class="footer-list">
            <li><a href="home.html"><i class="fas fa-chevron-right"></i><span>Inicio</span></a></li>
            <li><a href="/nosotros
            "><i class="fas fa-chevron-right"></i><span>Nosotros</span></a></li>
            <li><a href="/contactanos"><i class="fas fa-chevron-right"></i><span>Contáctanos</span></a></li>
            <li><a href="/login"><i class="fas fa-chevron-right"></i><span>Iniciar Sesión (Sistema)</span></a></li>
          </ul>
        </div>

        <div class="col-lg-4 col-md-12 mb-4 footer-contact">
          <h4 class="footer-title">Contacto</h4>
          <ul class="contact-list">
            <li><i class="fas fa-map-marker-alt"></i><span>Cúcuta, Norte de Santander, Colombia</span></li>
            <li><i class="fas fa-phone-alt"></i>
              <div>
                <span>+57 300 522 4818</span><br>
                <span>+57 310 267 3398</span><br>
                <span>+57 310 267 5612</span>
              </div>
            </li>
            <li><i class="fas fa-envelope"></i><span>emplanortesas@gmail.com</span></li>
            <li><i class="fas fa-clock"></i>
              <div>
                <span>Lun - Vie: 8:00 AM - 5:00 PM</span><br>
                <span>Sábados: 8:00 AM - 12:00 PM</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p class="mb-0 text-center">&copy; 2025 <strong>Emplanorte S.A.S.</strong> Todos los derechos reservados.</p>
      </div>
    </div>

    <button class="scroll-to-top" id="scrollToTop" title="Volver arriba">
      <i class="fas fa-arrow-up"></i>
    </button>
  </footer>
  `;

  footerContainer.innerHTML = footerHTML;
}

/**
 * Marca el enlace de navegación activo según la página actual.
 */
function setActiveNavLink() {
  let currentPage = window.location.pathname.split('/').pop() || 'home.html';
  currentPage = currentPage.split('?')[0].split('#')[0].toLowerCase();

  document.querySelectorAll('.nav-link, .mobile-nav-list a').forEach(link => {
    link.classList.remove('active');
  });

  if (currentPage.includes('home')) {
    document.getElementById('nav-home')?.classList.add('active');
    document.getElementById('mobile-nav-home')?.classList.add('active');
  } else if (currentPage.includes('nosotros')) {
    document.getElementById('nav-nosotros')?.classList.add('active');
    document.getElementById('mobile-nav-nosotros')?.classList.add('active');
  } else if (currentPage.includes('contactanos')) {
    document.getElementById('nav-contactanos')?.classList.add('active');
    document.getElementById('mobile-nav-contactanos')?.classList.add('active');
  } else if (currentPage.includes('login')) {
    document.getElementById('btnHeaderLogin')?.classList.add('active');
  }
}

/**
 * Menú móvil (hamburguesa).
 */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
}

/**
 * Botón "volver arriba".
 */
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (!scrollToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollToTopBtn.classList.add('visible');
    else scrollToTopBtn.classList.remove('visible');
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Header adaptativo por sección (cuando el fondo es claro).
 */
function initAdaptiveHeader() {
  const header = document.querySelector('.main-header');
  const sections = document.querySelectorAll('[data-header-theme]');
  if (!header || sections.length === 0) return;

  const updateHeaderStyle = (entries) => {
    let isOverLightSection = false;
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.dataset.headerTheme === 'light') {
        isOverLightSection = true;
      }
    });
    if (isOverLightSection) header.classList.add('force-background');
    else header.classList.remove('force-background');
  };

  const observer = new IntersectionObserver(updateHeaderStyle, {
    root: null,
    rootMargin: `0px 0px -100% 0px`,
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

// --- PUNTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();

  // Esperamos a que el header y el footer estén en el DOM
  setTimeout(() => {
    setActiveNavLink();
    initMobileMenu();
    initScrollToTop();
    initAdaptiveHeader();
  }, 80);
});
