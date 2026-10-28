# About, toolkit, and detail-view changes

Changes are already applied locally. This guide records exactly what changed relative to the files present at the start of this request (saved under `.design-review/before`). Original line numbers refer to those snapshots, not Git HEAD. Apply blocks from bottom to top if reproducing manually. Do not reapply them to the current files.

## Request map

- About: `aboutStudio` in os/os.js; portrait geometry and choreography in os/motion.js; layout in os/expressive.css.
- Hover reveal: only the SVG aperture moves. The night photo is fixed at x=-600, y=-50, width=2220, height=2220 in a 1000-unit image plane. These four values calibrate alignment. The independent photos differ in pose, glasses and lighting, so the match is approximate.
- Infinite languages: `skillsStudio` creates two identical logo groups, with the duplicate hidden from assistive technology. A GSAP tween shifts the track by half its width and repeats without a gap. Hover and the button pause it; reduced motion shows one static grid.
- AMSA: removed from portfolio.html; the renderer also filters the old entry defensively. Certification artwork is selected by title rather than its former array index.
- Detail windows: `buildStory` makes the image lead, preserves the existing narrative and links, and separates additional media. The same renderer covers every standard card detail. The existing photography gallery keeps its specialized interaction.
- Lifecycle: `replace`, `closeWindow`, `minimize` and `focusWindow` own animation setup, cleanup and restore. Search routes About and Languages through their custom views.

## Existing files: exact deletions and replacements

## index.html

### Insert before original line 14

Delete:
```
(nothing — insertion only)
```

Replace with:
```
  <link rel="stylesheet" href="os/expressive.css">
```

### Insert before original line 15

Delete:
```
(nothing — insertion only)
```

Replace with:
```
  <script src="os/vendor/gsap.min.js" defer></script>
  <script src="os/vendor/ScrollTrigger.min.js" defer></script>
  <script src="os/vendor/MorphSVGPlugin.min.js" defer></script>
  <script src="os/motion.js" defer></script>
```

## portfolio.html

### Original lines 143–143

Delete:
```
          <li>★ <strong>AMSA Food Safety & Science Certification</strong></li>
```

Replace with:
```
(nothing — delete the block)
```

## os/os.js

### Insert before original line 73

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    window.dispatchEvent(new Event('rahul-motion-change'));
```

### Insert before original line 328

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    win.animation?.resume?.();
```

### Insert before original line 364

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    win.dispose?.();
```

### Insert before original line 387

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    win.animation?.pause?.();
```

### Insert before original line 578

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    win.dispose?.();
    win.body.classList.remove('about-surface', 'skills-surface', 'detail-surface');
```

### Insert before original line 580

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    if ($('.about-race', win.body)) win.body.classList.add('about-surface');
    if ($('.skills-lab', win.body)) win.body.classList.add('skills-surface');
    if ($('.story-poster', win.body)) win.body.classList.add('detail-surface');
    clamp(win);
    win.dispose = window.RahulMotion?.mount(win);
```

### Insert before original line 643

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    if (id === 'languages') return skillsStudio(win);
    if (id === 'about') return aboutStudio(win);
```

### Original lines 660–660

Delete:
```
    all('img', article).forEach((img, imageIndex) => {
```

Replace with:
```
    all('img:not([data-decoration])', article).forEach((img, imageIndex) => {
```

### Original lines 782–782

Delete:
```
    all('.floating-badge', doc).forEach(el => el.remove());
```

Replace with:
```
(nothing — delete the block)
```

### Original lines 787–787

Delete:
```
    hero.append(thumbnail(item));
```

Replace with:
```
    const image = /CodeGana/i.test(item.title) ? 'images/CGScreenshot.png' :
      /DriveDrop/i.test(item.title) ? 'images/drivedrop-grand-cherokee-blue.png' : item.image;
    if (image) {
      const img = element('img', 'story-main-image');
      img.src = image; img.alt = /CodeGana/i.test(item.title) ? 'CodeGana coding interface' : item.alt || item.title;
      img.width = 1000; img.height = 650; img.decoding = 'async';
      hero.append(img);
    } else {
      const video = $('video', doc);
      if (video) hero.append(video);
      else hero.append(thumbnail(item));
    }
```

### Original lines 791–792

Delete:
```
    // Move text and links rather than copying layout wrappers from the résumé.
    all('p,ul,ol', doc).filter(el => !el.parentElement.closest('p,ul,ol'))
```

Replace with:
```
    all('p,ul,ol,.skill-grid', doc).filter(el => !el.parentElement.closest('p,ul,ol,.skill-grid'))
```

### Original lines 798–799

Delete:
```
    media.append(element('h3', '', 'A closer look'));
    all('img,video', doc).forEach(el => media.append(el));
```

Replace with:
```
    media.append(element('h3', '', 'Inside the project'));
    const rail = element('div', 'story-evidence');
    all('img,video', doc).filter(el => el.getAttribute('src') !== image)
      .forEach(el => { el.loading = 'lazy'; rail.append(el); });
    if (!rail.children.length) {
      media.append(element('p', '', 'Explore the project through its overview and linked resources.'));
    } else media.append(rail);
```

### Insert before original line 834

Delete:
```
(nothing — insertion only)
```

Replace with:
```
    const wrap = element('article', 'skills-lab');
```

### Original lines 835–835

Delete:
```
    studio.append(element('h2', 'story-title', 'Tools of my trade'));
```

Replace with:
```
    const header = element('header', 'skills-heading');
    header.append(element('h2', 'story-title', 'Tools of my trade'),
      element('p', '', 'Languages, frameworks, and the systems I build with them.'));
    const viewport = element('div', 'tech-marquee');
    viewport.setAttribute('aria-label', 'Languages and technologies');
    const track = element('div', 'marquee-track');
    const group = element('ul', 'marquee-group');
    const logos = { Java:'java', Python:'python', 'C++':'cplusplus', TypeScript:'typescript', React:'react', FastAPI:'fastapi', OpenCV:'opencv', Firebase:'firebase', Selenium:'selenium', Flask:'flask', Swift:'swift', 'HTML / CSS':'html5' };
```

### Original lines 837–840

Delete:
```
    const wheel = element('div', 'tech-wheel');
    wheel.setAttribute('aria-label', 'Technology carousel');
    // Bundled Devicon artwork, with local monograms as a fallback.
    const logos = Object.fromEntries(Object.entries({ Java: 'java', Python: 'python', 'C++': 'cplusplus', TypeScript: 'typescript', React: 'react', FastAPI: 'fastapi', OpenCV: 'opencv', Firebase: 'firebase', Selenium: 'selenium', Flask: 'flask', Swift: 'swift', 'HTML / CSS': 'html5' }).map(([name, slug]) => [name, 'images/tech/' + slug + '.svg']));
```

Replace with:
```
(nothing — delete the block)
```

### Original lines 843–848

Delete:
```
      const tile = element('div', 'tech-tile');
      const img = element('img');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" rx="50" fill="#0d4356"/><text x="50" y="61" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="bold" fill="white">${name.slice(0,2).replace(/&/g,'&amp;')}</text></svg>`;
      img.src = logos[name] || 'data:image/svg+xml,' + encodeURIComponent(svg);
      img.alt = ''; tile.append(img, element('strong', '', name));
      wheel.append(tile);
```

Replace with:
```
      const tile = element('li', 'tech-token');
      const img = element('img'); img.src = 'images/tech/' + logos[name] + '.svg'; img.alt = ''; img.width = 64; img.height = 64;
      tile.append(img, element('strong', '', name)); group.append(tile);
```

### Original lines 850–860

Delete:
```
    wheel.tabIndex = 0;
    const controls = element('div', 'wheel-controls');
    const scroll = delta => wheel.scrollBy({ left: delta * 220,
      behavior: reduced.matches || !motion ? 'instant' : 'smooth' });
    controls.append(button('← Previous tools', () => scroll(-1)), button('Next tools →', () => scroll(1)));
    wheel.onkeydown = event => {
      if (['ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault(); scroll(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    studio.append(controls, wheel);
```

Replace with:
```
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true'); duplicate.inert = true;
    track.append(group, duplicate); viewport.append(track);
    const controls = element('div', 'marquee-controls');
    const toggle = button('Pause motion', () => {
      const paused = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
      viewport.dataset.paused = String(paused);
      viewport.dispatchEvent(new Event('marquee-toggle'));
    }, 'marquee-toggle');
    toggle.setAttribute('aria-pressed', 'false');
    controls.append(element('span', '', 'A toolkit in constant motion.'), toggle);
    studio.append(header, viewport, controls);
```

### Original lines 863–863

Delete:
```
    credentials.append(element('h2', 'story-title', 'Earned along the way'));
```

Replace with:
```
    credentials.append(element('h2', 'story-title', 'Credentials & honors'));
```

### Original lines 865–865

Delete:
```
    all('.cert-list li', source(data.languages[1])).forEach((li, i) => {
```

Replace with:
```
    all('.cert-list li', source(data.languages[1])).filter(li => !/AMSA|Food Safety/i.test(li.textContent)).forEach(li => {
```

### Original lines 868–872

Delete:
```
      const heading = element('h3', '', $('strong', li)?.textContent || li.textContent);
      const detail = li.textContent.replace($('strong', li)?.textContent || '', '').replace(/\u2605/g, '').trim();
      copy.append(heading, element('p', '', detail));
      const src = i === 0 ? 'images/neuralseek_Image.jpeg' :
        i === 5 ? 'images/TMKIntern.jpeg' : null;
```

Replace with:
```
      const title = $('strong', li)?.textContent || li.textContent;
      copy.append(element('h3', '', title));
      const description = li.textContent.replace(title, '').replace(/\u2605/g, '').trim();
      if (description) copy.append(element('p', '', description));
      const src = /AI Agent Builder/i.test(title) ? 'images/neuralseek_Image.jpeg' : /TechMeKid|Front-End/i.test(title) ? 'images/TMKIntern.jpeg' : null;
```

### Original lines 874–878

Delete:
```
        const img = element('img'); img.src = src; img.alt = heading.textContent;
        const enlarge = button('', () => openGallery(heading.textContent, [{src,alt:img.alt}], 0), 'image-button');
        enlarge.setAttribute('aria-label', 'Enlarge ' + img.alt);
        enlarge.append(img); row.append(enlarge);
      } else row.append(element('span', 'credential-seal', 'RA'));
```

Replace with:
```
        const img = element('img'); img.src = src; img.alt = title; img.loading = 'lazy';
        const enlarge = button('', () => openGallery(title, [{src,alt:title}], 0), 'image-button');
        enlarge.setAttribute('aria-label', 'Enlarge ' + title); enlarge.append(img); row.append(enlarge);
      }
```

### Original lines 881–882

Delete:
```
    credentials.append(list);
    replace(win, [studio, credentials]);
```

Replace with:
```
    credentials.append(list); wrap.append(studio, credentials);
    replace(win, [wrap]);
```

### Original lines 886–908

Delete:
```
    const wrap = element('article', 'about-editorial');
    const composition = element('header', 'about-composition');
    const portrait = element('img', 'editorial-portrait');
    portrait.src = 'images/IMG_1180.JPG'; portrait.alt = 'Rahul Anand';
    const name = element('div', 'about-name');
    name.append(element('h2', '', 'Rahul Anand'),
      element('p', '', 'Computer science at Texas A&M. AI systems, developer tools, and a camera along for the ride.'));
    composition.append(portrait, name);
    const navigation = element('div', 'about-chapters');
    const chapter = element('section', 'about-chapter');
    const names = ['Snapshot', 'Experience', 'Toolkit', 'Beyond code'];
    function show(i) {
      const doc = source(data.about[i]);
      const heading = $('h2', doc);
      if (heading) heading.textContent = names[i];
      const content = element('div', 'chapter-content');
      content.append(...doc.childNodes);
      chapter.replaceChildren(content);
      all('button', navigation).forEach((b,j) => b.setAttribute('aria-pressed', String(i===j)));
    }
    data.about.forEach((item,i) => navigation.append(button(names[i] || item.title, () => show(i))));
    wrap.append(composition, navigation, chapter);
    replace(win, [wrap]); show(0);
```

Replace with:
```
    const wrap = element('article', 'about-race');
    const hero = element('header', 'about-hero');
    const intro = element('div', 'about-intro');
    const title = element('h2', 'about-title');
    title.append(element('span', '', 'Rahul'), element('span', '', 'Anand'));
    intro.append(title, element('p', '', 'Computer science at Texas A&M. AI systems, developer tools, and a camera along for the ride.'));
    const jump = button('Meet the person', () => {
      const target = $('.about-story', win.body);
      win.body.scrollTo({top: target.offsetTop - win.body.offsetTop - 20,
        behavior: reduced.matches || !motion ? 'instant' : 'smooth'});
      target.focus({preventScroll:true});
    }, 'about-jump');
    intro.append(jump);
    const portrait = element('div', 'portrait-reveal');
    portrait.tabIndex = 0;
    portrait.setAttribute('role', 'group');
    portrait.setAttribute('aria-label', 'Interactive portrait of Rahul Anand. Move your pointer to reveal the second portrait. Use arrow keys to move the reveal, or toggle the second portrait below.');
    portrait.innerHTML = `<img class="portrait-base" src="images/rahul_suit_day.jpg" alt="Rahul Anand in a blue suit" width="1024" height="1024">
      <div class="portrait-hidden" aria-hidden="true"><img src="images/rahul_suit_night.jpg" alt="" width="1024" height="1024"></div>`;
    const visual = element('div', 'about-visual');
    const caption = element('div', 'portrait-caption');
    const toggle = button('Reveal night portrait', () => {
      const pressed = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(pressed));
      toggle.textContent = pressed ? 'Show day portrait' : 'Reveal night portrait';
      portrait.classList.toggle('reveal-full', pressed);
    }, 'portrait-toggle');
    toggle.setAttribute('aria-pressed','false');
    caption.append(element('span', '', 'Two sides. Same curiosity.'), toggle);
    visual.append(portrait, caption); hero.append(intro, visual);
    wrap.append(hero);
    const names = ['The person behind the work', 'Built in the real world', 'My technical toolkit', 'Beyond the screen'];
    data.about.forEach((item, i) => {
      const section = element('section', 'about-story about-story-' + i);
      section.tabIndex = -1;
      const doc = source(item);
      const oldTitle = $('h2', doc); if (oldTitle) oldTitle.remove();
      all('.floating-badge',doc).forEach(el => el.remove());
      section.append(element('h2', '', names[i] || item.title));
      const content = element('div', 'about-story-content');
      content.append(...doc.childNodes); section.append(content);
      if (i === 3) {
        const photos = element('div', 'about-photo-strip');
        [['jp4.jpg','A view from Japan'],['ind4.jpg','A view from India'],['jp8.jpg','Travel photography from Japan']].forEach(([src,alt])=>{
          const img = element('img'); img.src='images/'+src;img.alt=alt;img.loading='lazy';img.width=500;img.height=500;photos.append(img);
        });
        section.append(photos);
      }
      wrap.append(section);
    });
    const end = element('footer', 'about-close');
    end.append(element('h2', '', 'Let’s build something.'), button('Get in touch', () => openApp('contact'), 'about-jump'));
    wrap.append(end); replace(win, [wrap]);
```

## New file: os/motion.js

Delete nothing. Create the file with this complete content:

```javascript
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
      const listen = (target, event, handler) => target.addEventListener(event, handler, {signal:events.signal});
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const noMotion = () => reduced.matches || document.body.classList.contains('reduced-motion');
      let context, marquee, morph, positionTween, suspended = false;
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
        svg.setAttribute('viewBox','0 0 1000 1000');
        svg.setAttribute('aria-hidden','true'); svg.classList.add('portrait-mask-art');
        svg.innerHTML = `<defs><clipPath id="portrait-aperture-${win.id}" clipPathUnits="userSpaceOnUse"><path transform="translate(500 500) scale(230)" d="M-1,0 C-1,-.6 -.65,-.94 -.1,-.9 C.45,-1.06 .98,-.55 1,-.05 C1.08,.54 .55,.9 .04,1 C-.6,1.04 -1.1,.55 -1,0Z"/></clipPath></defs><g class="portrait-image-plane" clip-path="url(#portrait-aperture-${win.id})"><image href="images/rahul_suit_night.jpg" x="-600" y="-50" width="2220" height="2220" preserveAspectRatio="none"/></g>`;
        hidden.replaceChildren(svg);
        const group = $('clipPath path', svg);
        const state = {x:.5,y:.5};
        const render = () => group.setAttribute('transform', `translate(${state.x * 1000} ${state.y * 1000}) scale(230)`);
        movePortrait = (x,y) => {
          const next = {x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};
          if (!gsap || noMotion()) { Object.assign(state,next);render();return; }
          positionTween?.kill();
          positionTween = gsap.to(state, {...next,duration:.22,ease:'power3.out',onUpdate:render,overwrite:true});
        };
        listen(portrait,'pointermove', event => {
          const rect = portrait.getBoundingClientRect();
          portrait.classList.add('reveal-active');
          movePortrait((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height);
        });
        listen(portrait,'pointerleave', () => portrait.classList.remove('reveal-active'));
        listen(portrait,'pointercancel', () => portrait.classList.remove('reveal-active'));
        listen(portrait,'focus', () => { portrait.classList.add('reveal-active');movePortrait(.5,.5); });
        listen(portrait,'blur', () => portrait.classList.remove('reveal-active'));
        listen(portrait,'keydown', event => {
          const delta = {ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]}[event.key];
          if (!delta) return;
          event.preventDefault(); movePortrait(state.x+delta[0], state.y+delta[1]);
        });
      }

      const viewport = $('.tech-marquee', root);
      let hovered = false;
      const syncMarquee = () => {
        if (!marquee) return;
        marquee.paused(suspended || hovered || pausedByUser || noMotion() || document.hidden);
      };
      if (viewport) {
        listen(viewport,'pointerenter', () => {hovered=true;syncMarquee();});
        listen(viewport,'pointerleave', () => {hovered=false;syncMarquee();});
        listen(viewport,'marquee-toggle', () => {pausedByUser=viewport.dataset.paused==='true';syncMarquee();});
      }
      listen(document,'visibilitychange',syncMarquee);
      const setup = () => {
        context?.revert(); marquee = null; morph = null;
        root.classList.toggle('motion-static', noMotion() || !gsap);
        if (!gsap || noMotion() || suspended) return;
        context = gsap.context(() => {
          const title = $('.about-title',root);
          if (title) {
            gsap.timeline({defaults:{duration:1,ease:'power4.out'}})
              .fromTo('.about-title span',{y:55,autoAlpha:0},{y:0,autoAlpha:1,stagger:.1})
              .fromTo('.about-intro p, .about-jump',{y:20,autoAlpha:0},{y:0,autoAlpha:1,stagger:.08},'<.15')
              .fromTo('.about-visual',{scale:.94,autoAlpha:0},{scale:1,autoAlpha:1,duration:1.2},'<');
            if (ScrollTrigger) {
              gsap.to('.about-visual',{y:-25,ease:'none',scrollTrigger:{trigger:$('.about-hero',root),scroller:root,start:'top top',end:'bottom top',scrub:.8}});
              all('.about-story',root).forEach(section => {
                gsap.from(all('h2, h3, p, li, .metric-card, .about-photo-strip img',section),{
                  y:24,autoAlpha:0,stagger:.055,duration:.75,ease:'power3.out',
                  scrollTrigger:{trigger:section,scroller:root,start:'top 88%',once:true}
                });
              });
              gsap.from('.about-photo-strip img',{rotation:i=>(i-1)*5,y:35,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:$('.about-photo-strip',root),scroller:root,start:'top 90%',once:true}});
            }
            if (MorphSVGPlugin) morph = gsap.to('.portrait-mask-art path',{
              morphSVG:'M-.96,-.1 C-.83,-.65 -.5,-1.03 .14,-.85 C.75,-.8 1.06,-.47 .9,.15 C.85,.77 .3,1.06 -.23,.9 C-.92,.77 -1.1,.35 -.96,-.1Z',duration:2.6,repeat:-1,yoyo:true,ease:'sine.inOut'
            });
          }
          if ($('.story-poster',root)) {
            gsap.timeline({defaults:{duration:.8,ease:'power4.out'}})
              .fromTo('.story-title',{y:32,autoAlpha:0},{y:0,autoAlpha:1})
              .fromTo('.story-role',{y:16,autoAlpha:0},{y:0,autoAlpha:1},'<.12')
              .fromTo('.story-hero',{y:36,scale:.97,autoAlpha:0},{y:0,scale:1,autoAlpha:1},'<.1');
            if (ScrollTrigger) all('.story-copy > *, .story-media > *',root).forEach(item=>{
              gsap.from(item,{y:24,autoAlpha:0,duration:.65,ease:'power3.out',scrollTrigger:{trigger:item,scroller:root,start:'top 95%',once:true}});
            });
          }
          if (viewport) {
            marquee = gsap.to($('.marquee-track',viewport),{xPercent:-50,duration:36,repeat:-1,ease:'none'});
            gsap.from('.skills-heading > *',{y:22,autoAlpha:0,stagger:.1,duration:.7,ease:'power3.out'});
            if (ScrollTrigger) all('.credential-timeline > li',root).forEach(item=>{
              gsap.from(item,{y:25,autoAlpha:0,duration:.6,scrollTrigger:{trigger:item,scroller:root,start:'top 94%',once:true}});
            });
            syncMarquee();
          }
        },root);

      };
      const resize = new ResizeObserver(() => { if (alive && ScrollTrigger) ScrollTrigger.refresh(); });
      resize.observe(root);
      all('img,video',root).forEach(media=>listen(media,'load',()=>{if(alive) ScrollTrigger?.refresh();}));
      listen(window,'rahul-motion-change', setup);
      listen(reduced,'change', setup);
      win.animation = {
        pause() {suspended=true;positionTween?.kill();context?.revert();context=null;marquee=null;},
        resume() {if(suspended){suspended=false;setup();}syncMarquee();ScrollTrigger?.refresh();}
      };
      setup();
      document.fonts.ready.then(()=>{if(alive)ScrollTrigger?.refresh();});
      return () => {
        alive=false;events.abort();resize.disconnect();positionTween?.kill();context?.revert();
        win.animation=null;
      };
    }
  };
})();
```

## New file: os/expressive.css

Delete nothing. Create the file with this complete content:

```css
/* About, toolkit and case-study interiors. Aero remains the desktop frame. */
:root {
  --studio-paper:#f5f6f1;
  --studio-ink:#19231e;
  --studio-accent:#c6f36b;
  --studio-muted:#e5e9df;
  --studio-space:clamp(22px,4vw,40px);
}
.about-surface,.skills-surface,.detail-surface { background:var(--studio-paper);color:var(--studio-ink);scrollbar-color:#64775d var(--studio-muted); }
.about-surface,.skills-surface { padding:0!important;scrollbar-gutter:auto; }
.about-race *, .skills-lab *, .story-poster * { box-sizing:border-box; }
.about-race ::selection,.skills-lab ::selection,.story-poster ::selection { background:var(--studio-accent);color:var(--studio-ink); }
.about-race button,.skills-lab button { min-height:44px;background:var(--studio-ink);color:var(--studio-paper);border:0;border-radius:99px;box-shadow:none;font-size:14px;font-weight:700;padding:12px 20px; }
.about-race button:hover,.skills-lab button:hover { background:#354633;transform:translateY(-2px); }
.about-race button:active,.skills-lab button:active { transform:translateY(1px); }
.about-race button:focus-visible,.skills-lab button:focus-visible { outline:3px solid #476d1a;outline-offset:4px; }
.about-hero { display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);align-items:center;gap:28px;padding:var(--studio-space);min-height:540px; }
.about-intro { min-width:0; }
.window-body .about-title { font-family:Nunito,sans-serif;font-size:clamp(52px,6.7vw,88px);font-weight:900;line-height:.94;letter-spacing:-.04em;color:var(--studio-ink);margin:0 0 28px; }
.about-title span { display:block; }
.about-intro p { font-size:16px;line-height:1.6;margin:0 0 28px;max-width:32ch; }
.about-jump { background:var(--studio-accent)!important;color:var(--studio-ink)!important; }
.about-jump:hover { background:#addc56!important; }
.about-visual { min-width:0; }
.portrait-reveal { position:relative;width:100%;aspect-ratio:1;isolation:isolate;overflow:hidden;border-radius:48% 48% 14px 14px;background:var(--studio-muted);touch-action:pan-y; }
.portrait-reveal:focus-visible { outline:4px solid #476d1a;outline-offset:4px; }
.portrait-base { display:block;width:100%;height:100%;object-fit:cover; }
.portrait-hidden { position:absolute;inset:0;pointer-events:none;opacity:0; }
/* Calibrated eye line and shoulder width. The night image stays stationary.
   Separate photos have different poses: these values align the primary landmarks. */
.portrait-hidden img { position:absolute;width:222%;height:222%;max-width:none;left:-60%;top:-5%;object-fit:fill; }
.portrait-reveal.reveal-active .portrait-hidden { opacity:1; }
.portrait-reveal.reveal-full .portrait-hidden { opacity:1;clip-path:none!important; }
.portrait-mask-defs { position:absolute;pointer-events:none; }
.portrait-caption { display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px;font-size:14px; }
.portrait-caption button { background:transparent;color:var(--studio-ink);padding:8px 0;text-decoration:underline;text-underline-offset:5px;border-radius:0; }
.portrait-caption button:hover { background:transparent;color:#36591a; }
.about-story { padding:64px var(--studio-space);outline-offset:-6px; }
.about-story>h2,.about-close h2 { margin:0 0 32px;color:inherit;font-size:clamp(28px,3.6vw,44px);line-height:1.05;letter-spacing:-.035em;font-weight:900;max-width:22ch; }
.about-story-content p,.about-story-content li { color:inherit;font-size:16px;line-height:1.65;max-width:65ch; }
.about-story-content h3 { color:inherit;font-size:22px;line-height:1.2;margin:32px 0 16px; }
.about-story-content h3:first-child { margin-top:0; }
.about-story-content a { color:inherit; }
.about-story-0 { background:var(--studio-muted); }
.about-story-1 { background:var(--studio-ink);color:var(--studio-paper); }
.about-story-3 { background:var(--studio-accent); }
.about-story .snapshot-grid { display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr);gap:30px; }
.about-story .metric-card { padding:20px 0;background:transparent; }
.about-story .metric-number { display:block;font-size:58px;line-height:1;font-weight:900;letter-spacing:-.03em; }
.about-story .metric-label { display:block;font-size:16px;line-height:1.5;margin-top:8px; }
.about-story .metric-tag { display:none; }
.about-story .metric-text-bold { font-size:24px;font-weight:800; }
.about-story .bio-list { padding-left:20px; }
.about-story .bio-list li { margin-bottom:12px; }
.about-story .experience-grid,.about-story .project-grid,.about-story .personal-grid { display:grid;grid-template-columns:1fr 1fr;gap:28px; }
.about-story .skill-category { margin-bottom:28px; }
.about-story .skill-tags,.about-story .tech-tags { display:flex;gap:10px;flex-wrap:wrap; }
.about-story .skill-tag { background:var(--studio-muted);color:var(--studio-ink);padding:10px 16px;border-radius:0;font-size:16px; }
.about-story img { max-width:100%; }
.about-photo-strip { display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:14px;margin-top:40px;align-items:center; }
.about-photo-strip img { display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:14px; }
.about-photo-strip img:nth-child(2) { aspect-ratio:.85; }
.about-close { padding:64px var(--studio-space); }
.about-close h2 { max-width:14ch; }
/* Clean toolkit typography with one continuously moving image ribbon. */
.skills-lab { padding:var(--studio-space); }
.skills-lab .tech-studio { padding:0;background:none;overflow:visible; }
.skills-heading { max-width:55ch; }
.skills-lab .story-title { color:var(--studio-ink);font-size:clamp(32px,4vw,52px);letter-spacing:-.035em; }
.skills-heading p { margin:0 0 28px; }
.tech-marquee { width:calc(100% + 2 * var(--studio-space));margin-left:calc(-1 * var(--studio-space));overflow:hidden;background:var(--studio-muted);padding:32px 0; }
.marquee-track { display:flex;width:max-content; }
.marquee-group { display:flex;align-items:center;gap:28px;list-style:none;padding:0 28px 0 0;margin:0;flex-shrink:0; }
.tech-token { width:132px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;flex-shrink:0; }
.tech-token img { width:60px;height:60px;object-fit:contain; }
.tech-token strong { font-size:16px;font-weight:700; }
.marquee-controls { display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0; }
.marquee-controls span { font-size:14px; }
.skills-lab .tech-studio>p { max-width:65ch; }
.skills-lab .credential-studio { padding-top:56px; }
.skills-lab .credential-timeline { padding:0;list-style:none;margin:0; }
.skills-lab .credential-timeline>li { display:flex;align-items:center;gap:24px;padding:24px 0;margin:0;background:none; }
.skills-lab .credential-timeline>li:nth-child(even) { background:none; }
.skills-lab .credential-timeline>li+li { margin-top:8px; }
.skills-lab .credential-timeline h3 { color:var(--studio-ink);font-size:22px;font-weight:800;line-height:1.25;margin:0; }
.skills-lab .credential-timeline p { margin:10px 0 0; }
.skills-lab .credential-timeline .image-button { flex:0 0 150px; }
.skills-lab .credential-timeline img { display:block;width:150px;height:110px;object-fit:contain;background:var(--studio-muted);padding:8px; }
.motion-static .marquee-track { width:100%;transform:none!important; }
.motion-static .marquee-group { width:100%;padding:0 20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 12px; }
.motion-static .marquee-group[aria-hidden=true] { display:none; }
.motion-static .tech-token { width:auto; }
.motion-static .marquee-toggle { display:none; }
/* Project details keep their original content with larger media and clear rhythm. */
.detail-surface .back-button { position:sticky;top:-24px;z-index:3;background:var(--studio-ink);color:var(--studio-paper);border:0;box-shadow:none;min-height:44px;font-size:14px; }
.detail-surface .story-poster { display:grid;grid-template-columns:minmax(0,1fr);gap:28px;background:var(--studio-paper);padding:8px 0 24px;animation:none; }
.detail-surface .story-header { grid-column:1; }
.detail-surface .story-title { color:var(--studio-ink);font-size:clamp(34px,5.4vw,68px);line-height:1;letter-spacing:-.04em;margin:8px 0 20px; }
.detail-surface .story-role { display:inline-block;font-size:16px;margin:0;background:var(--studio-accent);padding:10px 16px;color:var(--studio-ink); }
.detail-surface .story-hero { margin:0;background:var(--studio-muted);min-width:0;overflow:hidden;border-radius:14px; }
.detail-surface .story-hero>.image-button { width:100%;display:block;padding:0;margin:0;border:0;box-shadow:none;background:none;border-radius:0; }
.detail-surface .story-main-image { display:block;width:100%;height:auto;max-height:430px;object-fit:contain;aspect-ratio:1.65;padding:24px; }
.detail-surface .codegana .story-hero { background:#ddf1bd; }
.detail-surface .codegana .story-main-image { padding:22px; }
.detail-surface .drivedrop .story-hero { background:#c9e3e9; }
.detail-surface .story-hero video { display:block;width:100%;max-height:430px; }
.detail-surface .story-layout { display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:32px;grid-column:1;padding-top:12px; }
.detail-surface .story-copy h3,.detail-surface .story-media h3 { color:var(--studio-ink);font-size:24px;letter-spacing:-.02em;margin:0 0 22px; }
.detail-surface .story-copy>p:first-of-type { font-size:18px;line-height:1.65; }
.detail-surface .story-copy p { max-width:65ch; }
.detail-surface .story-copy li { margin:10px 0; }
.detail-surface .story-links { display:flex;gap:12px;flex-wrap:wrap;margin-top:28px; }
.detail-surface .story-links a { background:var(--studio-ink);color:var(--studio-paper);font-size:14px;min-height:44px;border-radius:99px;display:inline-flex;align-items:center;padding:12px 20px;transition:transform .2s; }
.detail-surface .story-links a:hover { transform:translateY(-3px); }
.detail-surface .story-media { display:block; }
.story-evidence { display:grid;gap:20px; }
.story-evidence .image-button { padding:12px;background:var(--studio-muted);border-radius:14px!important; }
.story-evidence img,.story-evidence video { width:100%;height:auto;max-height:360px;object-fit:contain;background:none; }
@media(max-width:700px) {
 .about-hero { grid-template-columns:1fr;padding:24px;gap:28px;min-height:0; }
 .window-body .about-title { font-size:clamp(48px,12vw,68px);margin-bottom:20px; }
 .about-title span { display:inline; }.about-title span+span::before { content:' '; }
 .about-intro p { max-width:40ch;margin-bottom:20px; }
 .portrait-reveal { max-width:450px;margin:auto; }
 .about-story { padding:40px 24px; }.about-story>h2 { font-size:30px; }
 .about-story .snapshot-grid,.about-story .experience-grid,.about-story .project-grid,.about-story .personal-grid { grid-template-columns:1fr;gap:24px; }
 .about-story .highlight-cards-wrapper { display:flex;gap:20px;flex-wrap:wrap; }.about-story .metric-card { flex:1 1 110px; }
 .about-story .metric-number { font-size:44px; }.about-close { padding:40px 24px; }
 .portrait-caption { font-size:14px;gap:6px; }
 .skills-lab { padding:24px;--studio-space:24px; }
 .marquee-controls { flex-wrap:wrap; }.marquee-controls span { display:none; }
 .skills-lab .credential-timeline>li { align-items:flex-start;gap:16px;flex-direction:column; }
 .skills-lab .credential-timeline .image-button { flex-basis:auto; }.skills-lab .credential-timeline img { width:180px;height:125px; }
 .skills-lab .credential-timeline h3 { font-size:20px; }
 .motion-static .marquee-group { grid-template-columns:repeat(3,minmax(0,1fr)); }
 .detail-surface .story-layout { grid-template-columns:1fr; }.detail-surface .story-main-image { padding:12px;aspect-ratio:1.3; }
 .detail-surface .story-title { font-size:34px; }.detail-surface .back-button { top:-18px; }
 .detail-surface .story-copy>p:first-of-type { font-size:17px; }
 .story-evidence { grid-template-columns:repeat(2,minmax(0,1fr));align-items:start; }
}
@media(prefers-reduced-motion:reduce) {
 .about-race button,.skills-lab button,.story-links a { transition:none; }
}
body.reduced-motion .about-race button,body.reduced-motion .skills-lab button,body.reduced-motion .story-links a { transition:none; }

.portrait-mask-art { display:block;width:100%;height:100%; }
.reveal-full .portrait-image-plane { clip-path:none; }
@media(min-width:701px) {
 .window:has(.about-surface) { height:min(720px,var(--workspace-height)); }
 .about-hero { min-height:0; }
 .about-visual { max-width:calc(var(--workspace-height) - 190px);justify-self:center; }
}
```

## New assets

- `os/vendor/`: GSAP 3.13.0, ScrollTrigger and MorphSVGPlugin, loaded before motion.js and os.js. Keep NOTICE.md and script copyright/license headers.
- `images/tech/`: copied from the existing proposed-redesign asset directory into the live image folder. Keep CREDITS.md.
- Portrait originals are unchanged.

## Verification

JavaScript syntax and new motion/style source lint passed. Impeccable source detection returned no findings. Browser checks confirmed the blob reveal, full-photo toggle, infinite marquee rendering, local logo loads, five remaining credentials, CodeGana details, phone layouts, reduced-motion text visibility and the corrected minimize/restore path. The full-page design inspector still flags existing shell styles; see AUDIT.md.
