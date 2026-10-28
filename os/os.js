'use strict';

(() => {
  const apps = [
    ['internships', 'Internships', 'Industry experience'],
    ['projects', 'Projects / Clubs', 'Things I’ve built'],
    ['languages', 'Languages / Certs', 'Skills & achievements'],
    ['design', 'Graphic Design', 'Visual explorations'],
    ['highschool', 'High School', 'Where it started'],
    ['about', 'About Me', 'The man behind the machine'],
    ['resume', 'Resume', 'The essentials, in one place'],
    ['contact', 'Contact', 'Let’s connect'],
  ];

  const $ = (selector, root = document) => root.querySelector(selector);

  const all = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const element = (tag, className, text) => {
    const el = document.createElement(tag);

    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;

    return el;
  };

  const button = (text, action, className = '') => {
    const b = element('button', className, text);
    b.type = 'button';
    b.addEventListener('click', action);
    return b;
  };

  const storage = {
    get(key) {
      try {
        return localStorage.getItem('rahul-os-' + key);
      } catch {
        return null;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem('rahul-os-' + key, value);
      } catch {
        // The OS remains usable when storage is unavailable.
      }
    },
  };

  let sound = false;
  let audio;
  let z = 1000;
  let data = {};
  let loaded = false;
  let loading;

  const windows = new Map();
  const media = matchMedia('(max-width:700px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');

  let motion = storage.get('motion') !== 'off';

  const syncMotion = () => {
    document.body.classList.toggle(
      'reduced-motion',
      !motion || reduced.matches,
    );
    window.dispatchEvent(new Event('rahul-motion-change'));
  };

  syncMotion();
  reduced.addEventListener('change', syncMotion);

  /* Optional synthesized sound: always muted on a fresh page load. */

  function chime() {
    if (!sound) return;

    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();

      audio.resume();

      const now = audio.currentTime;

      [660, 880].forEach((frequency, i) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0, now + i * 0.045);
        gain.gain.linearRampToValueAtTime(0.035, now + i * 0.045 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.16);

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start(now + i * 0.045);
        oscillator.stop(now + i * 0.045 + 0.18);
      });
    } catch {
      // Audio is optional.
    }
  }

  function toggleSound(value) {
    sound = value;

    $('#sound').textContent = sound ? 'Sound on' : 'Sound off';
    $('#sound').setAttribute('aria-pressed', String(sound));
    $('#sound').setAttribute(
      'aria-label',
      sound ? 'Mute sound effects' : 'Enable sound effects',
    );

    const input = $('#sound-setting');
    if (input) input.checked = sound;

    chime();
  }

  $('#sound').onclick = () => toggleSound(!sound);

  /* Desktop app icons */

  // Change src to use a separate image. Leave it empty to use the existing atlas.
  // Each atlas icon has its own crop and optical alignment controls.
  const appIcons = {
    internships: { src: '', x: 0.75, y: 0, scale: 1, dx: 0, dy: 0 },
    projects: { src: '', x: 100 / 3, y: 0, scale: 1, dx: 0, dy: 0 },
    languages: { src: '', x: 198 / 3, y: 0, scale: 1, dx: 0, dy: 0 },
    design: { src: '', x: 99, y: 0, scale: 1, dx: 0, dy: 0 },
    highschool: { src: '', x: 1, y: 95, scale: 1, dx: 0, dy: 0 },
    about: { src: '', x: 100 / 3, y: 97, scale: 1, dx: 0, dy: 0 },
    resume: { src: '', x: 196 / 3, y: 98, scale: 1, dx: 0, dy: 0 },
    contact: { src: '', x: 99, y: 99, scale: 1, dx: 0, dy: 0 },
  };

  function icon(id) {
    const config = appIcons[id];
    const art = element('span', 'app-art');
    art.setAttribute('aria-hidden', 'true');
    art.style.setProperty('--x', config.x + '%');
    art.style.setProperty('--y', config.y + '%');
    art.style.setProperty('--icon-scale', config.scale);
    art.style.setProperty('--icon-dx', config.dx + 'px');
    art.style.setProperty('--icon-dy', config.dy + 'px');
    if (config.src) {
      art.classList.add('individual-icon');
      const img = element('img');
      img.src = config.src;
      img.alt = '';
      art.append(img);
    }
    return art;
  }

  apps.forEach(([id, name, description], index) => {
    const b = button('', () => openApp(id), 'app-button');

    b.dataset.appId = id;
    b.setAttribute('aria-label', `Open ${name}`);

    b.append(
      icon(id),
      element('strong', '', name),
      element('small', '', description),
    );

    $(index < 5 ? '#work-apps' : '#personal-apps').append(b);
  });

  all('[data-app]').forEach((b) => {
    b.onclick = () => openApp(b.dataset.app);
  });

  /*
   * Read the existing portfolio pages as content.
   * DOMParser does not execute their scripts.
   * Original interactive controls are replaced by OS interactions.
   */

  function sanitize(node) {
    const copy = node.cloneNode(true);

    all('script,button', copy).forEach((el) => el.remove());

    [copy, ...all('*', copy)].forEach((el) => {
      [...el.attributes].forEach((attribute) => {
        if (
          attribute.name.startsWith('on') ||
          ['id', 'style'].includes(attribute.name)
        ) {
          el.removeAttribute(attribute.name);
        }
      });

      if (el.tagName === 'A') {
        el.rel = 'noopener noreferrer';

        if (/^javascript:/i.test(el.getAttribute('href') || '')) {
          el.removeAttribute('href');
        }
      }

      if (el.tagName === 'IMG') {
        el.loading = 'lazy';
        el.decoding = 'async';
      }

      if (el.tagName === 'VIDEO') {
        el.removeAttribute('autoplay');
        el.controls = true;
        el.preload = 'none';
      }
    });

    return copy;
  }

  async function loadContent() {
    $('#load-error').hidden = true;

    try {
      const sources = await Promise.all(
        ['portfolio.html', 'profile.html'].map(async (path) => {
          const response = await fetch(path);

          if (!response.ok) {
            throw Error('Content unavailable');
          }

          return new DOMParser().parseFromString(
            await response.text(),
            'text/html',
          );
        }),
      );

      const [work, profile] = sources;

      const card = (node) => {
        const safe = sanitize(node);

        return {
          title: $('h2,h3', safe)?.textContent.trim() || 'Details',
          subtitle:
            $('.cyber-subtitle,.card-tag', safe)?.textContent.trim() || '',
          html: safe.innerHTML,
          summary: $('p', safe)?.textContent || '',
          image: $('img', safe)?.getAttribute('src') || '',
          alt: $('img', safe)?.alt || '',
        };
      };

      apps.slice(0, 5).forEach(([id]) => {
        const section = $('#' + id, work);

        if (!section) {
          throw Error('Missing category');
        }

        data[id] = [...section.children]
          .filter((el) => el.classList.contains('y2k-card'))
          .flatMap((el) => {
            if (el.classList.contains('carousel-section-card')) {
              return all('.carousel-card-3d', el).map(card);
            }

            return [card(el)];
          });
      });

      // This image appeared in the original CodeGana detail dialog.
      data.projects[0].html +=
        '<img src="images/CGmascotLeft!.png" ' +
        'alt="CodeGana mascot" loading="lazy">';

      data.about = all('.about-section', profile).map(card);

      loaded = true;
    } catch (error) {
      loaded = false;
      $('#load-error').hidden = false;
      throw error;
    }
  }

  loading = loadContent();
  loading.catch(() => {});

  $('#retry').onclick = () => {
    loading = loadContent();
    loading.catch(() => {});
  };

  function announce(text) {
    $('#announcement').textContent = text;
  }

  /* Window manager */

  function focusWindow(win) {
    for (const item of windows.values()) {
      item.el.classList.remove('focused');
      item.task.classList.remove('task-active');
    }

    win.el.hidden = false;
    win.animation?.resume?.();
    win.el.style.zIndex = ++z;
    win.el.classList.add('focused');
    win.task.classList.add('task-active');
    win.task.setAttribute('aria-pressed', 'true');

    for (const item of windows.values()) {
      if (item !== win) {
        item.task.setAttribute('aria-pressed', 'false');
      }
    }
  }

  function foreground() {
    return [...windows.values()]
      .filter((win) => !win.el.hidden)
      .sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
  }

  function returnFocus(win) {
    if (win.opener?.isConnected) {
      win.opener.focus();
    } else {
      $('#show-desktop').focus();
    }
  }

  function pause(win) {
    all('video', win.body).forEach((video) => video.pause());
  }

  function closeWindow(win) {
    pause(win);
    win.dispose?.();

    win.el.remove();
    win.task.remove();
    windows.delete(win.id);

    all(`[data-app-id="${win.id}"]`).forEach((b) => {
      b.dataset.open = 'false';
    });

    const next = foreground();

    if (next) {
      focusWindow(next);
      next.el.focus();
    } else {
      returnFocus(win);
    }

    announce(`${win.title} closed`);
  }

  function minimize(win) {
    pause(win);
    win.animation?.pause?.();

    win.el.hidden = true;
    win.task.classList.remove('task-active');
    win.task.setAttribute('aria-pressed', 'false');

    const next = foreground();

    if (next) {
      focusWindow(next);
      next.el.focus();
    } else {
      returnFocus(win);
    }
  }

  function workspace() {
    const top = Math.ceil($('.system-bar').getBoundingClientRect().bottom) + 10;
    const bottom = Math.floor($('.dock').getBoundingClientRect().top) - 12;
    const area = {
      left: 8,
      top,
      width: innerWidth - 16,
      height: Math.max(1, bottom - top),
    };
    document.documentElement.style.setProperty('--workspace-top', top + 'px');
    document.documentElement.style.setProperty(
      '--workspace-height',
      area.height + 'px',
    );
    return area;
  }

  function clamp(win, center = false) {
    const area = workspace();
    win.el.style.maxHeight = area.height + 'px';
    if (media.matches || win.el.classList.contains('maximized')) return;
    const width = win.el.offsetWidth;
    const height = win.el.offsetHeight;
    const left = center
      ? area.left + (area.width - width) / 2
      : parseFloat(win.el.style.left);
    const top = center
      ? area.top + (area.height - height) / 2
      : parseFloat(win.el.style.top);
    win.el.style.left =
      Math.max(
        area.left,
        Math.min(left || area.left, area.left + area.width - width),
      ) + 'px';
    win.el.style.top =
      Math.max(
        area.top,
        Math.min(top || area.top, area.top + area.height - height),
      ) + 'px';
  }

  function newWindow(id, title) {
    const el = element('section', 'window');

    el.tabIndex = -1;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', title);

    const bar = element('div', 'titlebar');
    const heading = element('h2', '', title);
    const controls = element('div', 'window-controls');
    const body = element('div', 'window-body');

    const win = {
      id,
      title,
      el,
      body,
      opener: document.activeElement,
      view: null,
    };

    const min = button('−', () => minimize(win));

    const max = button('□', () => {
      el.classList.toggle('maximized');

      max.setAttribute(
        'aria-label',
        el.classList.contains('maximized')
          ? 'Restore window'
          : 'Maximize window',
      );

      clamp(win);
    });

    const close = button('×', () => closeWindow(win));

    min.setAttribute('aria-label', 'Minimize ' + title);
    max.setAttribute('aria-label', 'Maximize window');
    close.setAttribute('aria-label', 'Close ' + title);

    controls.append(min, max, close);
    bar.append(heading, controls);
    el.append(bar, body);

    $('#windows').append(el);

    // Center after adding the task: the dock may change size.

    win.task = button(title, () => {
      focusWindow(win);
      el.focus();
    });

    win.task.setAttribute('aria-label', 'Restore or focus ' + title);

    $('#tasks').append(win.task);
    workspace();
    windows.set(id, win);

    all(`[data-app-id="${id}"]`).forEach((b) => {
      b.dataset.open = 'true';
    });

    el.addEventListener('pointerdown', () => {
      focusWindow(win);
    });

    el.addEventListener('focusin', () => {
      if (!el.classList.contains('focused')) {
        focusWindow(win);
      }
    });

    let drag;

    bar.onpointerdown = (event) => {
      if (
        media.matches ||
        event.target.closest('button') ||
        el.classList.contains('maximized') ||
        event.button !== 0
      ) {
        return;
      }

      const rect = el.getBoundingClientRect();

      drag = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      bar.setPointerCapture(event.pointerId);
    };

    bar.onpointermove = (event) => {
      if (!drag) return;

      el.style.left = event.clientX - drag.x + 'px';
      el.style.top = event.clientY - drag.y + 'px';
      clamp(win);
    };

    bar.onpointerup = bar.onpointercancel = () => {
      drag = null;
    };

    bar.ondblclick = (event) => {
      if (!media.matches && !event.target.closest('button')) {
        max.click();
      }
    };

    focusWindow(win);
    clamp(win, true);
    el.focus();

    chime();
    announce(title + ' opened');

    return win;
  }

  addEventListener('resize', () => {
    windows.forEach((win) => clamp(win));
  });

  $('#show-desktop').onclick = () => {
    const visible = [...windows.values()].some((win) => !win.el.hidden);

    windows.forEach((win) => {
      if (visible) {
        minimize(win);
      } else {
        focusWindow(win);
      }
    });

    $('#show-desktop').focus();
  };

  function replace(win, children) {
    pause(win);
    win.dispose?.();
    win.body.classList.remove(
      'about-surface',
      'skills-surface',
      'detail-surface',
    );
    win.body.replaceChildren(...children);
    win.body.scrollTop = 0;
    if ($('.about-race', win.body)) win.body.classList.add('about-surface');
    if ($('.skills-lab', win.body)) win.body.classList.add('skills-surface');
    if ($('.story-poster', win.body)) win.body.classList.add('detail-surface');
    clamp(win);
    win.dispose = window.RahulMotion?.mount(win);
  }

  /* App collections and details */

  function collection(win, id) {
    win.view = null;
    if (id === 'about') return aboutStudio(win);
    if (id === 'languages') return skillsStudio(win);

    const description = apps.find((app) => app[0] === id)?.[2] || 'Portfolio';

    const intro = element(
      'p',
      'app-caption',
      `${description} · Select an item to explore.`,
    );

    const grid = element('div', 'collection poster-collection');

    data[id].forEach((item, index) => {
      const b = button('', () => detail(win, id, index), 'file-card');

      b.classList.add('poster-tile', brand(item));
      b.append(thumbnail(item));

      const text = element('span', 'file-text');

      text.append(element('strong', '', item.title));

      if (item.subtitle) {
        text.append(element('small', '', item.subtitle));
      }

      if (item.summary) {
        text.append(element('p', '', item.summary));
      }

      text.append(element('span', 'open-label', 'Explore details ↗'));

      b.append(text);
      grid.append(b);
    });

    const parts = [intro, grid];

    if (id === 'about') {
      const portrait = element('img', 'portrait');
      portrait.src = 'images/IMG_1180.JPG';
      portrait.alt = 'Rahul Anand';
      parts.unshift(portrait);
    }

    replace(win, parts);
  }

  function detail(win, id, index) {
    if (id === 'languages') return skillsStudio(win);
    if (id === 'about') return aboutStudio(win);
    win.view = { id, index };

    const item = data[id][index];
    const article = element('article', 'detail');

    if (/Instagram Photography/i.test(item.title))
      return photography(win, item);
    buildStory(article, item);

    const back = button(
      '← Back to ' + apps.find((app) => app[0] === id)[1],
      () => {
        collection(win, id);
        $('.file-card', win.body)?.focus();
      },
      'back-button',
    );

    all('img:not([data-decoration])', article).forEach((img, imageIndex) => {
      const trigger = button(
        '',
        () =>
          openGallery(
            item.title,
            all('img', article).map((image) => ({
              src: image.src,
              alt: image.alt,
            })),
            imageIndex,
          ),
        'image-button',
      );

      trigger.setAttribute('aria-label', 'Enlarge ' + img.alt);

      img.replaceWith(trigger);
      trigger.append(img);
    });

    replace(win, [back, article]);
    back.focus();

    chime();
  }

  function openGallery(title, images, start) {
    let win = windows.get('gallery');

    if (!win) {
      win = newWindow('gallery', 'Image viewer');
    }

    focusWindow(win);

    win.el.classList.add('gallery-window');
    let index = start;
    function render() {
      const wrap = element('div', 'gallery-stage');
      const img = element('img');
      img.src = images[index].src;
      img.alt = images[index].alt;
      const previous = button('←', () => move(-1), 'gallery-prev');
      const next = button('→', () => move(1), 'gallery-next');
      previous.setAttribute('aria-label', 'Previous image');
      next.setAttribute('aria-label', 'Next image');
      const caption = element(
        'p',
        'gallery-caption',
        `${index + 1} / ${images.length} · ${img.alt}`,
      );
      caption.setAttribute('aria-live', 'polite');
      wrap.append(previous, img, next, caption);
      replace(win, [wrap]);
    }
    function move(delta) {
      index = (index + delta + images.length) % images.length;
      // Keep the focused navigation button connected while updating the image.
      const img = $('.gallery-stage > img', win.body);
      img.src = images[index].src;
      img.alt = images[index].alt;
      $('.gallery-caption', win.body).textContent =
        `${index + 1} / ${images.length} · ${img.alt}`;
    }
    win.el.onkeydown = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    render();
    win.el.focus();
  }

  function link(label, url, className = 'pill') {
    const a = element('a', className, label);

    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    return a;
  }

  /* Editorial renderers: source content remains in portfolio.html/profile.html. */
  function source(item) {
    return new DOMParser().parseFromString(item.html, 'text/html').body;
  }

  function brand(item) {
    return /DriveDrop/i.test(item.title)
      ? 'drivedrop'
      : /CodeGana/i.test(item.title)
        ? 'codegana'
        : 'portfolio-brand';
  }

  function thumbnail(item) {
    const art = element('div', 'tile-art');
    if (/DriveDrop/i.test(item.title)) {
      const img = element('img', 'tile-logo');
      img.src = 'images/drivedropLogo.png';
      img.alt = 'DriveDrop logo';
      img.loading = 'lazy';
      img.decoding = 'async';
      art.append(img);
    } else if (item.image) {
      const img = element('img');
      img.src = item.image;
      img.alt = item.alt;
      img.loading = 'lazy';
      art.append(img);
      if (/CodeGana/i.test(item.title)) {
        img.className = 'tile-logo';
        const mascot = element('img', 'tile-mascot');
        mascot.src = 'images/CGmascotLeft!.png';
        mascot.alt = 'CodeGana mascot';
        art.append(mascot);
      }
    } else {
      art.append(element('span', 'typographic-cover', item.title));
    }
    return art;
  }

  function buildStory(article, item) {
    article.className = 'detail story-poster ' + brand(item);
    const doc = source(item);
    const header = element('header', 'story-header');
    header.append(element('h2', 'story-title', item.title));
    if (item.subtitle) header.append(element('p', 'story-role', item.subtitle));
    const hero = element('figure', 'story-hero');
    const image = /CodeGana/i.test(item.title)
      ? 'images/CGScreenshot.png'
      : /DriveDrop/i.test(item.title)
        ? 'images/drivedrop-grand-cherokee-blue.png'
        : item.image;
    if (image) {
      const img = element('img', 'story-main-image');
      img.src = image;
      img.alt = /CodeGana/i.test(item.title)
        ? 'CodeGana coding interface'
        : item.alt || item.title;
      img.width = 1000;
      img.height = 650;
      img.decoding = 'async';
      hero.append(img);
    } else {
      const video = $('video', doc);
      if (video) hero.append(video);
      else hero.append(thumbnail(item));
    }
    const layout = element('div', 'story-layout');
    const copy = element('section', 'story-copy');
    copy.append(element('h3', '', 'The work'));
    all('p,ul,ol,.skill-grid', doc)
      .filter((el) => !el.parentElement.closest('p,ul,ol,.skill-grid'))
      .forEach((el) => copy.append(el));
    const links = element('div', 'story-links');
    all('a[href]', doc).forEach((a) => links.append(a));
    copy.append(links);
    const media = element('section', 'story-media');
    media.append(element('h3', '', 'Inside the project'));
    const rail = element('div', 'story-evidence');
    all('img,video', doc)
      .filter((el) => el.getAttribute('src') !== image)
      .forEach((el) => {
        el.loading = 'lazy';
        rail.append(el);
      });
    if (!rail.children.length) {
      media.append(
        element(
          'p',
          '',
          'Explore the project through its overview and linked resources.',
        ),
      );
    } else media.append(rail);
    layout.append(copy, media);
    article.append(header, hero, layout);
  }

  function photography(win, item) {
    const images = all('img', source(item)).map((img) => ({
      src: img.getAttribute('src'),
      alt: img.alt,
      category: /\/jp/i.test(img.getAttribute('src'))
        ? 'Japan'
        : /\/ind/i.test(img.getAttribute('src'))
          ? 'India'
          : 'Other',
    }));
    const back = button(
      '← Graphic Design',
      () => collection(win, 'design'),
      'back-button',
    );
    const heading = element('h2', 'story-title', 'Through my lens');
    const filters = element('div', 'photo-filters');
    filters.setAttribute('aria-label', 'Photo category');
    const grid = element('div', 'travel-grid');
    function show(category) {
      const subset = images.filter(
        (img) => category === 'All' || img.category === category,
      );
      all('button', filters).forEach((b) =>
        b.setAttribute('aria-pressed', String(b.textContent === category)),
      );
      grid.replaceChildren();
      subset.forEach((photo, i) => {
        const trigger = button(
          '',
          () => openGallery(item.title, subset, i),
          'travel-photo',
        );
        const img = element('img');
        img.src = photo.src;
        img.alt = photo.alt;
        img.loading = 'lazy';
        trigger.setAttribute('aria-label', 'Enlarge ' + photo.alt);
        trigger.append(img);
        grid.append(trigger);
      });
    }
    ['All', ...new Set(images.map((img) => img.category))].forEach((category) =>
      filters.append(button(category, () => show(category))),
    );
    replace(win, [back, heading, filters, grid]);
    show('All');
  }

  function skillsStudio(win) {
    const wrap = element('article', 'skills-lab');
    const studio = element('section', 'tech-studio');
    const header = element('header', 'skills-heading');
    header.append(
      element('h2', 'story-title', 'Tools of my trade'),
      element(
        'p',
        '',
        'Languages, frameworks, and the systems I build with them.',
      ),
    );
    const viewport = element('div', 'tech-marquee');
    viewport.setAttribute('aria-label', 'Languages and technologies');
    const track = element('div', 'marquee-track');
    const group = element('ul', 'marquee-group');
    const logos = {
      Java: 'java',
      Python: 'python',
      'C++': 'cplusplus',
      TypeScript: 'typescript',
      React: 'react',
      FastAPI: 'fastapi',
      OpenCV: 'opencv',
      Firebase: 'firebase',
      Selenium: 'selenium',
      Flask: 'flask',
      Swift: 'swift',
      'HTML / CSS': 'html5',
    };
    const doc = source(data.languages[0]);
    all('.skill-tag', doc).forEach((tag) => {
      const name = tag.textContent.trim();
      const tile = element('li', 'tech-token');
      const img = element('img');
      img.src = 'images/tech/' + logos[name] + '.svg';
      img.alt = '';
      img.width = 64;
      img.height = 64;
      tile.append(img, element('strong', '', name));
      group.append(tile);
    });
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.inert = true;
    track.append(group, duplicate);
    viewport.append(track);
    const controls = element('div', 'marquee-controls');
    const toggle = button(
      'Pause motion',
      () => {
        const paused = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
        viewport.dataset.paused = String(paused);
        viewport.dispatchEvent(new Event('marquee-toggle'));
      },
      'marquee-toggle',
    );
    toggle.setAttribute('aria-pressed', 'false');
    controls.append(
      element('span', '', 'A toolkit in constant motion.'),
      toggle,
    );
    studio.append(header, viewport, controls);
    all('p', doc).forEach((p) => studio.append(p));
    const credentials = element('section', 'credential-studio');
    credentials.append(element('h2', 'story-title', 'Credentials & honors'));
    const list = element('ul', 'credential-timeline');
    all('.cert-list li', source(data.languages[1]))
      .filter((li) => !/AMSA|Food Safety/i.test(li.textContent))
      .forEach((li) => {
        const row = element('li');
        const copy = element('div');
        const title = $('strong', li)?.textContent || li.textContent;
        copy.append(element('h3', '', title));
        const description = li.textContent
          .replace(title, '')
          .replace(/\u2605/g, '')
          .trim();
        if (description) copy.append(element('p', '', description));
        const src = /AI Agent Builder/i.test(title)
          ? 'images/neuralseek_Image.jpeg'
          : /TechMeKid|Front-End/i.test(title)
            ? 'images/TMKIntern.jpeg'
            : null;
        if (src) {
          const img = element('img');
          img.src = src;
          img.alt = title;
          img.loading = 'lazy';
          const enlarge = button(
            '',
            () => openGallery(title, [{ src, alt: title }], 0),
            'image-button',
          );
          enlarge.setAttribute('aria-label', 'Enlarge ' + title);
          enlarge.append(img);
          row.append(enlarge);
        }
        row.append(copy);
        list.append(row);
      });
    credentials.append(list);
    wrap.append(studio, credentials);
    replace(win, [wrap]);
  }

  function aboutStudio(win) {
    const wrap = element('article', 'about-race');
    const hero = element('header', 'about-hero');
    const intro = element('div', 'about-intro');
    const title = element('h2', 'about-title');
    title.append(element('span', '', 'Rahul'), element('span', '', 'Anand'));
    intro.append(
      title,
      element(
        'p',
        '',
        'Computer science at Texas A&M. AI systems, developer tools, and a camera along for the ride.',
      ),
    );
    const jump = button(
      'Meet the person',
      () => {
        const target = $('.about-story', win.body);
        win.body.scrollTo({
          top: target.offsetTop - win.body.offsetTop - 20,
          behavior: reduced.matches || !motion ? 'instant' : 'smooth',
        });
        target.focus({ preventScroll: true });
      },
      'about-jump',
    );
    intro.append(jump);
    const portrait = element('div', 'portrait-reveal');
    portrait.tabIndex = 0;
    portrait.setAttribute('role', 'group');
    portrait.setAttribute(
      'aria-label',
      'Interactive portrait of Rahul Anand. Move your pointer to reveal the second portrait. Use arrow keys to move the reveal, or toggle the second portrait below.',
    );
    portrait.innerHTML = `
          <img
            class="portrait-base"
            src="images/rahul_suit_day.jpg"
            alt="Rahul Anand in a blue suit"
            width="1024"
            height="1024"
          />
          <div class="portrait-hidden" aria-hidden="true">
            <img src="images/rahul_suit_night.jpg" alt="" width="1024" height="1024" />
          </div>
        `;
    const visual = element('div', 'about-visual');
    const caption = element('div', 'portrait-caption');
    const toggle = button(
      'Reveal night portrait',
      () => {
        const pressed = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(pressed));
        toggle.textContent = pressed
          ? 'Show day portrait'
          : 'Reveal night portrait';
        portrait.classList.toggle('reveal-full', pressed);
      },
      'portrait-toggle',
    );
    toggle.setAttribute('aria-pressed', 'false');
    caption.append(element('span', '', 'Two sides. Same curiosity.'), toggle);
    visual.append(portrait, caption);
    hero.append(intro, visual);
    wrap.append(hero);
    const names = [
      'The person behind the work',
      'Built in the real world',
      'My technical toolkit',
      'Beyond the screen',
    ];
    data.about.forEach((item, i) => {
      const section = element('section', 'about-story about-story-' + i);
      section.tabIndex = -1;
      const doc = source(item);
      const oldTitle = $('h2', doc);
      if (oldTitle) oldTitle.remove();
      all('.floating-badge', doc).forEach((el) => el.remove());
      section.append(element('h2', '', names[i] || item.title));
      const content = element('div', 'about-story-content');
      content.append(...doc.childNodes);
      section.append(content);
      if (i === 3) {
        const photos = element('div', 'about-photo-strip');
        [
          ['jp4.jpg', 'A view from Japan'],
          ['ind4.jpg', 'A view from India'],
          ['jp8.jpg', 'Travel photography from Japan'],
        ].forEach(([src, alt]) => {
          const img = element('img');
          img.src = 'images/' + src;
          img.alt = alt;
          img.loading = 'lazy';
          img.width = 500;
          img.height = 500;
          photos.append(img);
        });
        section.append(photos);
      }
      wrap.append(section);
    });
    const end = element('footer', 'about-close');
    end.append(
      element('h2', '', 'Let’s build something.'),
      button('Get in touch', () => openApp('contact'), 'about-jump'),
    );
    wrap.append(end);
    replace(win, [wrap]);
  }

  /* Résumé */

  function resume(win) {
    const heading = element('h2', '', 'Resume');

    const description = element(
      'p',
      '',
      'A closer look at my experience, education, and skills.',
    );

    const actions = element('div');
    const img = element('img', 'resume-preview');

    img.src = 'images/Anand_Rahul_Resume_Web.png';
    img.alt = 'Rahul Anand Resume';
    img.loading = 'lazy';

    const download = link('Download PDF', 'images/Rahul_Anand_Resume.pdf');

    download.download = 'Rahul_Anand_Resume.pdf';

    actions.append(
      link('Open PDF ↗', 'images/Rahul_Anand_Resume.pdf'),
      download,
    );

    replace(win, [heading, description, actions, img]);
  }

  /* Contact */

  function contact(win) {
    const heading = element('h2', '', 'Let’s connect');

    const description = element(
      'p',
      '',
      'Interested in collaborating or discussing opportunities?',
    );

    const links = element('div', 'contact-links');

    [
      [
        'Email me',
        'https://mail.google.com/mail/?view=cm&fs=1&to=rahulanandbus@gmail.com',
        'images/gmailIcon.png',
      ],
      [
        'LinkedIn',
        'https://www.linkedin.com/in/rahul-anand-39b214320/',
        'images/linkedinLogo.webp',
      ],
      [
        'GitHub',
        'https://github.com/rahulanandcs?tab=repositories',
        'images/githubIcon.webp',
      ],
    ].forEach(([name, url, src]) => {
      const a = link(name, url, '');
      const img = element('img');

      img.src = src;
      img.alt = '';

      a.prepend(img);
      links.append(a);
    });

    const copy = button('Copy email address', async () => {
      try {
        await navigator.clipboard.writeText('rahulanandbus@gmail.com');

        copy.textContent = 'Email copied';
      } catch {
        copy.textContent = 'rahulanandbus@gmail.com';
      }

      announce(copy.textContent);
    });

    replace(win, [
      heading,
      description,
      links,
      element('p', '', 'rahulanandbus@gmail.com'),
      copy,
    ]);
  }

  /* Settings */

  function settings(win) {
    const heading = element('h2', '', 'Make yourself at home');

    const description = element(
      'p',
      'app-caption',
      'Your preferences stay in this browser. Sound always starts muted.',
    );

    function row(title, text, checked, change, id) {
      const label = element('label', 'setting');
      const copy = element('span');
      const input = element('input');

      copy.append(element('strong', '', title), element('p', '', text));

      input.type = 'checkbox';
      input.checked = checked;

      if (id) input.id = id;

      input.onchange = () => change(input.checked);

      label.append(copy, input);

      return label;
    }

    const motionRow = row(
      'Expressive motion',
      reduced.matches
        ? 'Your system requests reduced motion; that preference takes priority.'
        : 'Window transitions and playful hover effects.',
      motion,
      (value) => {
        motion = value;
        storage.set('motion', value ? 'on' : 'off');
        syncMotion();
      },
    );

    const soundRow = row(
      'Sound effects',
      'Quiet, synthesized chimes when you explore.',
      sound,
      toggleSound,
      'sound-setting',
    );

    const reset = button('Reset preferences', () => {
      motion = true;
      storage.set('motion', 'on');
      toggleSound(false);
      syncMotion();
      settings(win);
    });

    replace(win, [
      heading,
      description,
      motionRow,
      soundRow,
      element(
        'p',
        'app-caption',
        'Rahul OS · Portfolio edition 1.0 · No tracking or account required.',
      ),
      reset,
    ]);
  }

  /* Search */

  function search(win) {
    const label = element(
      'label',
      '',
      'Find an app, project, skill, or achievement',
    );

    label.htmlFor = 'portfolio-search';

    const input = element('input', 'search-input');
    input.id = 'portfolio-search';
    input.type = 'search';
    input.placeholder = 'Try “React”, “DriveDrop”, or “Resume”…';

    const results = element('div');
    results.setAttribute('aria-live', 'polite');

    const entries = apps.map(([id, name, description]) => ({
      name,
      desc: description,
      id,
      index: null,
      text: name + ' ' + description,
    }));

    Object.entries(data).forEach(([id, items]) => {
      items.forEach((item, index) => {
        const doc = new DOMParser().parseFromString(item.html, 'text/html');

        entries.push({
          name: item.title,
          desc: apps.find((app) => app[0] === id)[1],
          id,
          index,
          text: doc.body.textContent,
        });
      });
    });

    function run() {
      const query = input.value.trim().toLowerCase();

      results.replaceChildren();

      const matches = entries.filter((entry) => {
        if (!query) return entry.index === null;

        return (entry.text + ' ' + entry.name).toLowerCase().includes(query);
      });

      if (!matches.length) {
        results.append(
          element('p', '', 'No matches. Try a project name or skill.'),
        );

        return;
      }

      matches.slice(0, 30).forEach((entry) => {
        const b = button(
          '',
          async () => {
            const target = await openApp(entry.id);

            if (target && entry.index !== null) {
              detail(target, entry.id, entry.index);
            }
          },
          'search-result',
        );

        b.append(
          element('strong', '', entry.name),
          element('small', '', entry.desc),
        );

        results.append(b);
      });
    }

    input.oninput = run;

    replace(win, [label, input, results]);
    run();
    input.focus();
  }

  /* Application routing */

  async function openApp(id) {
    const names = {
      settings: 'Settings',
      search: 'Search',
    };

    const title = apps.find((app) => app[0] === id)?.[1] || names[id];

    if (!title) return;

    let win = windows.get(id);

    if (win) {
      focusWindow(win);
      win.el.focus();
      return win;
    }

    win = newWindow(id, title);

    if (id === 'settings') {
      settings(win);
      return win;
    }

    if (id === 'resume') {
      resume(win);
      return win;
    }

    if (id === 'contact') {
      contact(win);
      return win;
    }

    replace(win, [element('p', '', 'Opening your portfolio…')]);

    try {
      if (!loaded) await loading;
      if (!windows.has(id)) return;

      if (id === 'search') {
        search(win);
      } else {
        collection(win, id);
      }
    } catch {
      replace(win, [
        element('p', '', 'Could not load the portfolio content.'),
        link('Read the original portfolio', 'portfolio.html'),
        button('Try again', async () => {
          loading = loadContent();
          loading.catch(() => {});

          closeWindow(win);
          await openApp(id);
        }),
      ]);
    }

    return win;
  }

  /* Keyboard shortcuts */

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openApp('search');
    }

    if (event.key === 'Escape') {
      if (!$('#boot').hidden) {
        dismissBoot();
        return;
      }

      const win = foreground();

      if (win) {
        event.preventDefault();
        closeWindow(win);
      }
    }
  });

  /* Clock */

  function clock() {
    const now = new Date();

    $('#clock').textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    $('#clock').dateTime = now.toISOString();

    $('#clock').title = now.toLocaleString([], {
      dateStyle: 'full',
      timeStyle: 'long',
    });
  }

  clock();
  setInterval(clock, 30000);

  /* Short, skippable startup */

  let bootTimer;

  function dismissBoot() {
    clearTimeout(bootTimer);
    $('#boot').hidden = true;

    try {
      sessionStorage.setItem('rahul-os-boot', '1');
    } catch {
      // Session persistence is optional.
    }
  }

  $('#skip-boot').onclick = dismissBoot;

  let seen = false;

  try {
    seen = sessionStorage.getItem('rahul-os-boot') === '1';
  } catch {
    // Continue without session storage.
  }

  const initial =
    location.hash.slice(1) || new URLSearchParams(location.search).get('tab');

  if (!seen && !initial && !reduced.matches && motion) {
    $('#boot').hidden = false;
    bootTimer = setTimeout(dismissBoot, 1100);
  }

  if (initial) {
    openApp(initial);
  }

  addEventListener('hashchange', () => {
    openApp(location.hash.slice(1));
  });
})();
