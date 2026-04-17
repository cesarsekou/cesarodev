/* ═══════════════════════════════════════════
       THEME INITIALIZATION
    ═══════════════════════════════════════════ */
    (function() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();

    /* ═══════════════════════════════════════════
       MAIN SCRIPT
    ═══════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', () => {

      // ── Theme Toggler ──
      const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
          const isDark = currentTheme === 'dark';
          const newTheme = isDark ? 'light' : 'dark';

          const applyTheme = () => {
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
          };

          if (!document.startViewTransition) {
             applyTheme();
             return;
          }

          // Calculate button center for the expanding circle
          const rect = themeToggle.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
          const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
          const maxRadius = Math.hypot(
            Math.max(x, viewportWidth - x),
            Math.max(y, viewportHeight - y)
          );

          const transition = document.startViewTransition(() => {
            applyTheme();
          });

          transition.ready.then(() => {
            const clipPath = [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ];

            // If switching to dark mode, we reverse the animation and animate the old view
            document.documentElement.animate(
              {
                clipPath: isDark ? clipPath : [...clipPath].reverse(),
              },
              {
                duration: 500,
                easing: "ease-in-out",
                pseudoElement: isDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
              }
            );
          });
        });
      }

      // ── Mobile Navigation ──
      const burger = document.getElementById('burger');
      const mobileNav = document.getElementById('mobileNav');

      if (burger && mobileNav) {
        burger.addEventListener('click', () => {
          burger.classList.toggle('active');
          mobileNav.classList.toggle('open');
          document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });
      }

      window.closeMobileNav = function() {
        if (burger && mobileNav) {
          burger.classList.remove('active');
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        }
      };

      // ── Header scroll effect ──
      const header = document.getElementById('header');
      window.addEventListener('scroll', () => {
        if (header) {
          header.classList.toggle('scrolled', window.scrollY > 50);
        }
      });

      // ── Scroll Reveal ──
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1,
      };

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

      // ── Animated Counters ──
      function animateCounter(el) {
        const target = parseInt(el.dataset.count);
        if (isNaN(target)) return;
        
        const suffix = el.textContent.includes('%') ? '%' : '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      }

      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

      // ── Active Navigation State ──
      const sections = document.querySelectorAll('.section');
      const navLinks = document.querySelectorAll('.nav__link');

      window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 200;
          if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
          }
        });
      });

      // ── Particles Canvas ──
      const canvas = document.getElementById('particles');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
          const hero = document.querySelector('.hero');
          if (hero) {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
          }
        }

        function createParticles() {
          particles = [];
          const count = Math.floor((canvas.width * canvas.height) / 45000);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              vx: (Math.random() - 0.5) * 0.2,
              vy: (Math.random() - 0.5) * 0.2,
              size: Math.random() * 1.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.05,
            });
          }
        }

        function drawParticles() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(137, 241, 156, ${p.opacity})`;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[j].x - p.x;
              const dy = particles[j].y - p.y;
              if (Math.abs(dx) > 120 || Math.abs(dy) > 120) continue; // Early exit for performance

              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(137, 241, 156, ${0.04 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          });

          animationId = requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', () => {
          resizeCanvas();
          createParticles();
        });

        resizeCanvas();
        createParticles();
        drawParticles();
      }
    });

    /* ═══════════════════════════════════════════
       PRELOADER LOGIC
    ═══════════════════════════════════════════ */
    document.addEventListener("DOMContentLoaded", () => {
      const progressBar = document.getElementById('preloader-bar');
      const preloader = document.getElementById('preloader');
      
      let progress = 0;
      const duration = 1500; // 1.5 seconds loading time minimum
      const interval = 20; 
      const increment = 100 / (duration / interval);
      
      const timer = setInterval(() => {
        progress += increment;
        
        const easedProgress = Math.min(progress, 100);
        progressBar.style.width = `${easedProgress}%`;
        
        if (progress >= 100) {
          clearInterval(timer);
          finishPreloader();
        }
      }, interval);
      
      function finishPreloader() {
        if (document.readyState === 'complete') {
          hidePreloader();
        } else {
          window.addEventListener('load', hidePreloader);
        }
      }
      
      function hidePreloader() {
        setTimeout(() => {
          preloader.classList.add('preloader-hidden');
          document.body.style.overflow = '';
          
          // Trigger initial scroll reveals
          setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.top <= window.innerHeight * 0.95) {
                el.classList.add('visible');
              }
            });
          }, 400);
        }, 200);
      }
    });

    /* ═══════════════════════════════════════════
       PWA SERVICE WORKER
    ═══════════════════════════════════════════ */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful');
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }

    /* ═══════════════════════════════════════════
       PRE-QUALIFICATION & CALENDLY EMBED
    ═══════════════════════════════════════════ */
    document.addEventListener("DOMContentLoaded", () => {
      const preQualBtns = document.querySelectorAll('.pre-qual-btn');
      const calendlyContainer = document.getElementById('calendly-container');
      const calendlyEmbed = document.getElementById('calendly-inline-widget');
      let calendlyLoaded = false;
      
      preQualBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          
          preQualBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          calendlyContainer.style.display = 'block';
          
          setTimeout(() => {
            calendlyContainer.style.opacity = '1';
          }, 10);
          
          if (!calendlyLoaded) {
            const initCalendly = () => {
              if (window.Calendly) {
                window.Calendly.initInlineWidget({
                  url: 'https://calendly.com/cesarsekou1',
                  parentElement: calendlyEmbed,
                  prefill: {
                    customAnswers: {
                      a1: this.getAttribute('data-type')
                    }
                  }
                });
                calendlyLoaded = true;
              } else {
                setTimeout(initCalendly, 100);
              }
            };
            initCalendly();
          } else {
             if (window.Calendly) {
               calendlyEmbed.innerHTML = '';
               window.Calendly.initInlineWidget({
                 url: 'https://calendly.com/cesarsekou1',
                 parentElement: calendlyEmbed,
                 prefill: {
                   customAnswers: {
                     a1: this.getAttribute('data-type')
                   }
                 }
               });
            }
          }
          
          setTimeout(() => {
             calendlyContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        });
      });
    });
