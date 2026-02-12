// Left sidebar: open/close when menu button or overlay/close is used
(function () {
    const menuBtn = document.getElementById('menu');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = sidebar && sidebar.querySelector('.sidebar-close');

    function openSidebar() {
        if (!overlay || !sidebar) return;
        overlay.classList.add('is-open');
        sidebar.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        sidebar.setAttribute('aria-hidden', 'false');
    }

    function closeSidebar() {
        if (!overlay || !sidebar) return;
        overlay.classList.remove('is-open');
        sidebar.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        sidebar.setAttribute('aria-hidden', 'true');
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', openSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
})();

const videoElement = document.getElementById('bg-video');

// Garante loop perfeito para vídeos que apresentam gap ao terminar.
// Aplica um pequeno deslocamento (epsilon) antes/reinício para evitar frame preto.
if (videoElement) {
    const src = (videoElement.currentSrc || (videoElement.querySelector('source') && videoElement.querySelector('source').src) || '').toLowerCase();

    // Função genérica que cria um loop suave usando 'timeupdate'
    const enablePerfectLoop = (epsilon = 0.06, startOffset = 0.02) => {
        // Desativa o loop nativo para controlar manualmente
        videoElement.removeAttribute('loop');

        const onTimeUpdate = function() {
            if (!this.duration || this.duration === Infinity) return;
            if (this.currentTime >= this.duration - epsilon) {
                // Avança para um pequeno offset no início e continua
                this.currentTime = startOffset;
                this.play();
            }
        };

        videoElement.addEventListener('timeupdate', onTimeUpdate);
    };

    // Aplica apenas quando for o(s) arquivo(s) que precisam do ajuste
    if (src.includes('videobg.mp4') || src.includes('coffee-bg-.mp4') || src.includes('coffee-bg-')) {
        // Espera metadata para conhecer a duração
        if (videoElement.readyState >= 1) {
            enablePerfectLoop();
        } else {
            videoElement.addEventListener('loadedmetadata', () => enablePerfectLoop());
        }
    } else {
        // Fallback: manter o comportamento simples de repetir
        videoElement.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }
}
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visivel");
        }
    });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));
window.addEventListener("load", () => {
    const track = document.getElementById('track');
    if (!track) return;
    const originalImages = Array.from(track.children);
    
    // 1. Define uma velocidade constante (Ex: 100 pixels por segundo)
    const pixelsPerSecond = 50;
  
    const setup = () => {
      // Garante cobertura da tela
      while (track.scrollWidth < window.innerWidth) {
        originalImages.forEach(img => track.appendChild(img.cloneNode(true)));
      }
      
      // Duplica para o loop perfeito
      const currentContent = Array.from(track.children);
      currentContent.forEach(img => track.appendChild(img.cloneNode(true)));
  
      // 2. CALCULA A DURACÃO DINÂMICA
      // Distância a percorrer é 50% do scrollWidth total
      const distanceToScroll = track.scrollWidth / 2;
      const dynamicDuration = distanceToScroll / pixelsPerSecond;
  
      // Aplica o tempo calculado diretamente no elemento
      track.style.animationDuration = `${dynamicDuration}s`;
    };
  
    setup();
  });

/* Marquee captions: delegação para suportar imagens clonadas no loop */
(function() {
    const track = document.getElementById('track');
    let captionBox = document.getElementById('marquee-caption');

    if (!captionBox) {
        const marqueeContainer = document.querySelector('.marquee-container');
        if (marqueeContainer) {
            captionBox = document.createElement('div');
            captionBox.id = 'marquee-caption';
            captionBox.className = 'marquee-caption';
            captionBox.setAttribute('aria-live', 'polite');
            marqueeContainer.parentNode.insertBefore(captionBox, marqueeContainer.nextSibling);
        }
    }

    if (!track || !captionBox) return;

    let hideTimeout = null;

    function showCaption(text) {
        captionBox.textContent = text || '';
        if (!text) { captionBox.classList.remove('visible'); return; }
        captionBox.classList.add('visible');
        if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
    }

    function hideCaptionDelayed() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(()=> captionBox.classList.remove('visible'), 300);
    }

    // Delegação: funciona para imagens originais e clones
    track.addEventListener('mouseover', (e) => {
        const img = e.target.closest('img');
        if (!img || !track.contains(img)) return;
        const caption = img.getAttribute('data-caption') || img.alt || '';
        showCaption(caption);
    });

    track.addEventListener('mouseout', (e) => {
        const fromImg = e.target.closest('img');
        if (!fromImg) return;
        const related = e.relatedTarget;
        if (related && (fromImg === related || fromImg.contains(related))) return;
        hideCaptionDelayed();
    });

    track.addEventListener('focusin', (e) => {
        const img = e.target.closest('img');
        if (!img || !track.contains(img)) return;
        showCaption(img.getAttribute('data-caption') || img.alt || '');
    });
    track.addEventListener('focusout', hideCaptionDelayed);

    track.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (!img || !track.contains(img)) return;
        const caption = img.getAttribute('data-caption') || img.alt || '';
        if (captionBox.classList.contains('visible') && captionBox.textContent === caption) captionBox.classList.remove('visible');
        else showCaption(caption);
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e)=> {
        if (!captionBox.contains(e.target) && !track.contains(e.target)) {
            captionBox.classList.remove('visible');
        }
    });
})();