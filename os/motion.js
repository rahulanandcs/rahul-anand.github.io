'use strict';

/* Each app view owns its listeners, tweens and ScrollTriggers. */
(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const MorphSVGPlugin = window.MorphSVGPlugin;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (gsap && MorphSVGPlugin) gsap.registerPlugin(MorphSVGPlugin);
  const $ = (s, r) => r.querySelector(s);
  const all = (s, r) => [...r.querySelectorAll(s)];

  window.RahulMotion = {
    mount(win) {
      const root = win.body;
      const events = new AbortController();
      const listen = (target, event, handler) =>
        target.addEventListener(event, handler, { signal: events.signal });
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const noMotion = () =>
        reduced.matches || document.body.classList.contains('reduced-motion');
      let context,
        marquee,
        morph,
        positionTween,
        suspended = false;
      let alive = true;
      let pausedByUser = false;
      const portrait = $('.portrait-reveal', root);
      let movePortrait = () => {};
      if (portrait) {
        // This is a reveal aperture, not an approximation of the subject's silhouette.
        // The underlying photo remains fixed; only this aperture follows the pointer.
        const ns = 'http://www.w3.org/2000/svg';
        const hidden = $('.portrait-hidden', portrait);
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 1000 1000');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('portrait-mask-art');
        svg.innerHTML = `
          <defs>
            <clipPath id="portrait-aperture-${win.id}" clipPathUnits="userSpaceOnUse">
              <path
                transform="translate(500 500) scale(230)"
                d="M-1,0 C-1,-.6 -.65,-.94 -.1,-.9 C.45,-1.06 .98,-.55 1,-.05 C1.08,.54 .55,.9 .04,1 C-.6,1.04 -1.1,.55 -1,0Z"
              />
            </clipPath>
          </defs>
          <g class="portrait-image-plane" clip-path="url(#portrait-aperture-${win.id})">
            <image
              href="images/rahul_suit_night.jpg"
              x="-600"
              y="-50"
              width="2220"
              height="2220"
              preserveAspectRatio="none"
            />
          </g>
        `;
        hidden.replaceChildren(svg);
        const group = $('clipPath path', svg);
        const state = { x: 0.5, y: 0.5 };
        const render = () =>
          group.setAttribute(
            'transform',
            `translate(${state.x * 1000} ${state.y * 1000}) scale(230)`,
          );
        movePortrait = (x, y) => {
          const next = {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y)),
          };
          if (!gsap || noMotion()) {
            Object.assign(state, next);
            render();
            return;
          }
          positionTween?.kill();
          positionTween = gsap.to(state, {
            ...next,
            duration: 0.22,
            ease: 'power3.out',
            onUpdate: render,
            overwrite: true,
          });
        };
        listen(portrait, 'pointermove', (event) => {
          const rect = portrait.getBoundingClientRect();
          portrait.classList.add('reveal-active');
          movePortrait(
            (event.clientX - rect.left) / rect.width,
            (event.clientY - rect.top) / rect.height,
          );
        });
        listen(portrait, 'pointerleave', () =>
          portrait.classList.remove('reveal-active'),
        );
        listen(portrait, 'pointercancel', () =>
          portrait.classList.remove('reveal-active'),
        );
        listen(portrait, 'focus', () => {
          portrait.classList.add('reveal-active');
          movePortrait(0.5, 0.5);
        });
        listen(portrait, 'blur', () =>
          portrait.classList.remove('reveal-active'),
        );
        listen(portrait, 'keydown', (event) => {
          const delta = {
            ArrowLeft: [-0.08, 0],
            ArrowRight: [0.08, 0],
            ArrowUp: [0, -0.08],
            ArrowDown: [0, 0.08],
          }[event.key];
          if (!delta) return;
          event.preventDefault();
          movePortrait(state.x + delta[0], state.y + delta[1]);
        });
      }

      const viewport = $('.tech-marquee', root);
      let hovered = false;
      const syncMarquee = () => {
        if (!marquee) return;
        marquee.paused(
          suspended || hovered || pausedByUser || noMotion() || document.hidden,
        );
      };
      if (viewport) {
        listen(viewport, 'pointerenter', () => {
          hovered = true;
          syncMarquee();
        });
        listen(viewport, 'pointerleave', () => {
          hovered = false;
          syncMarquee();
        });
        listen(viewport, 'marquee-toggle', () => {
          pausedByUser = viewport.dataset.paused === 'true';
          syncMarquee();
        });
      }
      listen(document, 'visibilitychange', syncMarquee);
      const graphics = $('.closing-graphics', root);
      let graphicsVisible = false;
      let graphicsObserver;
      const graphicStates = all('.animated-graphic', root).map((figure) => ({
        image: $('img', figure),
        canvas: $('canvas', figure),
        ready: false,
      }));
      const syncGraphics = () => {
        if (!graphics) return;
        const playing = alive && graphicsVisible && !suspended && !document.hidden
          && !noMotion() && graphics.dataset.paused !== 'true';
        const toggle = $('.graphics-toggle', graphics);
        toggle.disabled = noMotion();
        toggle.textContent = noMotion() ? 'Motion reduced' : graphics.dataset.paused === 'true'
          ? 'Play animations' : 'Pause animations';
        graphicStates.forEach((state) => {
          const { image, canvas } = state;
          if ((playing || (graphicsVisible && !state.ready)) && !image.hasAttribute('src')) {
            image.src = image.dataset.animationSrc;
          }
          image.hidden = !playing || !state.ready;
          canvas.hidden = playing && state.ready;
          if (!playing && state.ready) image.removeAttribute('src');
        });
      };
      graphicStates.forEach((state) => {
        listen(state.image, 'load', () => {
          if (!alive || !state.image.naturalWidth) return;
          const { canvas, image } = state;
          canvas.width = 800;
          canvas.height = Math.round(800 * image.naturalHeight / image.naturalWidth);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          state.ready = true;
          syncGraphics();
        });
      });
      if (graphics) {
        graphicsObserver = new IntersectionObserver(([entry]) => {
          graphicsVisible = entry.isIntersecting;
          syncGraphics();
        }, { root, rootMargin: '80px' });
        graphicsObserver.observe(graphics);
        listen(graphics, 'graphics-toggle', syncGraphics);
      }
      listen(document, 'visibilitychange', syncGraphics);
      listen(root, 'work-selection', (event) => {
        if (!gsap || noMotion() || suspended || !context) return;
        context.add(() => {
          gsap.fromTo(event.target, { y: 14, opacity: 0.35 }, {
            y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', overwrite: true,
          });
        });
      });
      const setup = () => {
        context?.revert();
        marquee = null;
        morph = null;
        root.classList.toggle('motion-static', noMotion() || !gsap);
        syncGraphics();
        if (!gsap || noMotion() || suspended) return;
        context = gsap.context(() => {
          const title = $('.about-title', root);
          if (title) {
            gsap
              .timeline({ defaults: { duration: 1, ease: 'power4.out' } })
              .fromTo(
                '.about-title span',
                { y: 55, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, stagger: 0.1 },
              )
              .fromTo(
                '.about-intro p, .about-jump',
                { y: 20, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, stagger: 0.08 },
                '<.15',
              )
              .fromTo(
                '.about-visual',
                { scale: 0.94, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 1.2 },
                '<',
              );
            if (ScrollTrigger) {
              gsap.to('.about-visual', {
                y: -25,
                ease: 'none',
                scrollTrigger: {
                  trigger: $('.about-hero', root),
                  scroller: root,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              });
              all('.about-story', root).forEach((section) => {
                gsap.fromTo(
                  all(
                    'h2, h3, p, li, .metric-card',
                    section,
                  ),
                  { y: 24 },
                  {
                    y: 0,
                    stagger: 0.055,
                    duration: 0.75,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: section,
                      scroller: root,
                      start: 'top 88%',
                      once: true,
                    },
                  },
                );
              });
              all('.work-track', root).forEach((panel, index) => {
                gsap.from(panel, {
                  x: index === 0 ? -24 : 24,
                  duration: 0.9,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: panel,
                    scroller: root,
                    start: 'top 90%',
                    once: true,
                  },
                });
              });
              const journey = $('.travel-journey', root);
              if (journey) {
                const stage = $('.travel-stage', journey);
                const canvas = $('.travel-canvas', journey);
                const path = $('.travel-route path', journey);
                const photo = $('.travel-photo', journey);
                const images = all('.travel-frames img', photo);
                const caption = $('figcaption', photo);
                const photos = JSON.parse(journey.dataset.photos);
                const state = { progress: 0 };
                const length = path.getTotalLength();
                const setX = gsap.quickSetter(photo, 'x', 'px');
                const setY = gsap.quickSetter(photo, 'y', 'px');
                const setRotation = gsap.quickSetter(photo, 'rotation', 'deg');
                const setOpacity = images.map((image) => gsap.quickSetter(image, 'opacity'));
                let width, height, photoWidth, photoHeight;
                const measure = () => {
                  journey.style.setProperty('--travel-stage-height', Math.min(580, root.clientHeight - 24) + 'px');
                  width = canvas.clientWidth;
                  height = canvas.clientHeight;
                  const size = Math.min(240, width * 0.4, height - 90);
                  journey.style.setProperty('--travel-photo-size', Math.max(80, size) + 'px');
                  photoWidth = photo.offsetWidth;
                  photoHeight = photo.offsetHeight;
                };
                const render = () => {
                  const point = path.getPointAtLength(state.progress * length);
                  const padding = 20;
                  setX(gsap.utils.clamp(padding, Math.max(padding, width - photoWidth - padding), point.x / 1000 * width - photoWidth / 2));
                  setY(gsap.utils.clamp(padding, Math.max(padding, height - photoHeight - padding), point.y / 640 * height - photoHeight / 2));
                  setRotation(Math.sin(state.progress * Math.PI * 2) * 7);
                  const phase = state.progress * (images.length - 1);
                  // Three already-loaded square photos crossfade without changing layout.
                  setOpacity.forEach((set, i) => set(Math.max(0, 1 - Math.abs(i - phase))));
                  caption.textContent = photos[Math.round(phase)].country + ' · Through my lens';
                };
                measure();
                gsap.to(state, {
                  progress: 1,
                  ease: 'none',
                  onUpdate: render,
                  scrollTrigger: {
                    trigger: journey,
                    scroller: root,
                    start: 'top top',
                    end: () => '+=' + Math.max(1, journey.offsetHeight - stage.offsetHeight),
                    scrub: 0.6,
                    onRefresh: () => {
                      measure();
                      render();
                    },
                  },
                });
                render();
              }
            }
            if (MorphSVGPlugin)
              morph = gsap.to('.portrait-mask-art path', {
                morphSVG:
                  'M-.96,-.1 C-.83,-.65 -.5,-1.03 .14,-.85 C.75,-.8 1.06,-.47 .9,.15 C.85,.77 .3,1.06 -.23,.9 C-.92,.77 -1.1,.35 -.96,-.1Z',
                duration: 2.6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
              });
          }
          if ($('.story-poster', root)) {
            gsap
              .timeline({ defaults: { duration: 0.8, ease: 'power4.out' } })
              .fromTo(
                '.story-title',
                { y: 32, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 },
              )
              .fromTo(
                '.story-role',
                { y: 16, autoAlpha: 0 },
                { y: 0, autoAlpha: 1 },
                '<.12',
              )
              .fromTo(
                '.story-hero',
                { y: 36, scale: 0.97, autoAlpha: 0 },
                { y: 0, scale: 1, autoAlpha: 1 },
                '<.1',
              );
            if (ScrollTrigger)
              all('.story-section, .story-highlight-list li', root).forEach((item) => {
                gsap.from(item, {
                  y: item.matches('li') ? 18 : 40,
                  duration: 0.85,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: item,
                    scroller: root,
                    start: 'top 95%',
                    once: true,
                  },
                });
              });
          }
          if (viewport) {
            marquee = gsap.to($('.marquee-track', viewport), {
              xPercent: -50,
              duration: 36,
              repeat: -1,
              ease: 'none',
            });
            gsap.from('.skills-heading > *', {
              y: 22,
              autoAlpha: 0,
              stagger: 0.1,
              duration: 0.7,
              ease: 'power3.out',
            });
            if (ScrollTrigger)
              all('.credential-timeline > li', root).forEach((item) => {
                gsap.from(item, {
                  y: 25,
                  autoAlpha: 0,
                  duration: 0.6,
                  scrollTrigger: {
                    trigger: item,
                    scroller: root,
                    start: 'top 94%',
                    once: true,
                  },
                });
              });
            syncMarquee();
          }
        }, root);
      };
      const resize = new ResizeObserver(() => {
        if (alive && ScrollTrigger) ScrollTrigger.refresh();
      });
      resize.observe(root);
      all('img,video', root).forEach((media) =>
        listen(media, 'load', () => {
          if (alive) ScrollTrigger?.refresh();
        }),
      );
      listen(window, 'rahul-motion-change', setup);
      listen(reduced, 'change', setup);
      win.animation = {
        pause() {
          suspended = true;
          syncGraphics();
          positionTween?.kill();
          context?.revert();
          context = null;
          marquee = null;
        },
        resume() {
          if (suspended) {
            suspended = false;
            setup();
          }
          syncMarquee();
          ScrollTrigger?.refresh();
        },
      };
      setup();
      document.fonts.ready.then(() => {
        if (alive) ScrollTrigger?.refresh();
      });
      return () => {
        alive = false;
        events.abort();
        resize.disconnect();
        graphicsObserver?.disconnect();
        graphicStates.forEach(({ image }) => image.removeAttribute('src'));
        positionTween?.kill();
        context?.revert();
        win.animation = null;
      };
    },
  };
})();
