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
      const setup = () => {
        context?.revert();
        marquee = null;
        morph = null;
        root.classList.toggle('motion-static', noMotion() || !gsap);
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
                gsap.from(
                  all(
                    'h2, h3, p, li, .metric-card, .about-photo-strip img',
                    section,
                  ),
                  {
                    y: 24,
                    autoAlpha: 0,
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
              gsap.from('.about-photo-strip img', {
                rotation: (i) => (i - 1) * 5,
                y: 35,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: $('.about-photo-strip', root),
                  scroller: root,
                  start: 'top 90%',
                  once: true,
                },
              });
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
              all('.story-copy > *, .story-media > *', root).forEach((item) => {
                gsap.from(item, {
                  y: 24,
                  autoAlpha: 0,
                  duration: 0.65,
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
        positionTween?.kill();
        context?.revert();
        win.animation = null;
      };
    },
  };
})();
