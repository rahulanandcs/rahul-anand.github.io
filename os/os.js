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
    ['contact', 'Contact', 'Let’s connect']
  ];

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const all = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

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
    }
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
      !motion || reduced.matches
    );
  };

  syncMotion();
  reduced.addEventListener('change', syncMotion);

  /* Optional synthesized sound: always muted on a fresh page load. */

  function chime() {
    if (!sound) return;

    try {
      audio ||= new (
        window.AudioContext || window.webkitAudioContext
      )();

      audio.resume();

      const now = audio.currentTime;

      [660, 880].forEach((frequency, i) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0, now + i * .045);
        gain.gain.linearRampToValueAtTime(
          .035,
          now + i * .045 + .015
        );
        gain.gain.exponentialRampToValueAtTime(
          .001,
          now + i * .045 + .16
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start(now + i * .045);
        oscillator.stop(now + i * .045 + .18);
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
      sound ? 'Mute sound effects' : 'Enable sound effects'
    );

    const input = $('#sound-setting');
    if (input) input.checked = sound;

    chime();
  }

  $('#sound').onclick = () => toggleSound(!sound);

  /* Desktop app icons */

  function icon(index) {
    const art = element('span', 'app-art');

    art.setAttribute('aria-hidden', 'true');
    art.style.setProperty('--x', `${index % 4 * 100 / 3}%`);
    art.style.setProperty('--y', index < 4 ? '0%' : '100%');

    return art;
  }

  apps.forEach(([id, name, description], index) => {
    const b = button('', () => openApp(id), 'app-button');

    b.dataset.appId = id;
    b.setAttribute('aria-label', `Open ${name}`);

    b.append(
      icon(index),
      element('strong', '', name),
      element('small', '', description)
    );

    $(index < 5 ? '#work-apps' : '#personal-apps').append(b);
  });

  all('[data-app]').forEach(b => {
    b.onclick = () => openApp(b.dataset.app);
  });

  /*
   * Read the existing portfolio pages as content.
   * DOMParser does not execute their scripts.
   * Original interactive controls are replaced by OS interactions.
   */

  function sanitize(node) {
    const copy = node.cloneNode(true);

    all('script,button', copy).forEach(el => el.remove());

    [copy, ...all('*', copy)].forEach(el => {
      [...el.attributes].forEach(attribute => {
        if (
          attribute.name.startsWith('on') ||
          ['id', 'style'].includes(attribute.name)
        ) {
          el.removeAttribute(attribute.name);
        }
      });

      if (el.tagName === 'A') {
        el.rel = 'noopener noreferrer';

        if (
          /^javascript:/i.test(el.getAttribute('href') || '')
        ) {
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
        ['portfolio.html', 'profile.html'].map(async path => {
          const response = await fetch(path);

          if (!response.ok) {
            throw Error('Content unavailable');
          }

          return new DOMParser().parseFromString(
            await response.text(),
            'text/html'
          );
        })
      );

      const [work, profile] = sources;

      const card = node => {
        const safe = sanitize(node);

        return {
          title:
            $('h2,h3', safe)?.textContent.trim() || 'Details',
          subtitle:
            $('.cyber-subtitle,.card-tag', safe)
              ?.textContent.trim() || '',
          html: safe.innerHTML,
          summary: $('p', safe)?.textContent || '',
          image: $('img', safe)?.getAttribute('src') || '',
          alt: $('img', safe)?.alt || ''
        };
      };

      apps.slice(0, 5).forEach(([id]) => {
        const section = $('#' + id, work);

        if (!section) {
          throw Error('Missing category');
        }

        data[id] = [...section.children]
          .filter(el => el.classList.contains('y2k-card'))
          .flatMap(el => {
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
      .filter(win => !win.el.hidden)
      .sort(
        (a, b) =>
          Number(b.el.style.zIndex) -
          Number(a.el.style.zIndex)
      )[0];
  }

  function returnFocus(win) {
    if (win.opener?.isConnected) {
      win.opener.focus();
    } else {
      $('#show-desktop').focus();
    }
  }

  function pause(win) {
    all('video', win.body).forEach(video => video.pause());
  }

  function closeWindow(win) {
    pause(win);

    win.el.remove();
    win.task.remove();
    windows.delete(win.id);

    all(`[data-app-id="${win.id}"]`).forEach(b => {
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

  function clamp(win) {
    if (
      media.matches ||
      win.el.classList.contains('maximized')
    ) {
      return;
    }

    const rect = win.el.getBoundingClientRect();

    win.el.style.left =
      Math.max(
        6,
        Math.min(rect.left, innerWidth - rect.width - 6)
      ) + 'px';

    win.el.style.top =
      Math.max(
        58,
        Math.min(rect.top, innerHeight - rect.height - 86)
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
      view: null
    };

    const min = button('−', () => minimize(win));

    const max = button('□', () => {
      el.classList.toggle('maximized');

      max.setAttribute(
        'aria-label',
        el.classList.contains('maximized')
          ? 'Restore window'
          : 'Maximize window'
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

    const count = windows.size % 4;

    el.style.left =
      Math.max(
        8,
        (innerWidth - Math.min(880, innerWidth * .86)) / 2 +
          count * 20
      ) + 'px';

    el.style.top = 78 + count * 22 + 'px';

    win.task = button(title, () => {
      focusWindow(win);
      el.focus();
    });

    win.task.setAttribute(
      'aria-label',
      'Restore or focus ' + title
    );

    $('#tasks').append(win.task);
    windows.set(id, win);

    all(`[data-app-id="${id}"]`).forEach(b => {
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

    bar.onpointerdown = event => {
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
        y: event.clientY - rect.top
      };

      bar.setPointerCapture(event.pointerId);
    };

    bar.onpointermove = event => {
      if (!drag) return;

      el.style.left =
        Math.max(
          6,
          Math.min(
            event.clientX - drag.x,
            innerWidth - el.offsetWidth - 6
          )
        ) + 'px';

      el.style.top =
        Math.max(
          58,
          Math.min(
            event.clientY - drag.y,
            innerHeight - el.offsetHeight - 86
          )
        ) + 'px';
    };

    bar.onpointerup = bar.onpointercancel = () => {
      drag = null;
    };

    bar.ondblclick = event => {
      if (
        !media.matches &&
        !event.target.closest('button')
      ) {
        max.click();
      }
    };

    focusWindow(win);
    clamp(win);
    el.focus();

    chime();
    announce(title + ' opened');

    return win;
  }

  addEventListener('resize', () => {
    windows.forEach(clamp);
  });

  $('#show-desktop').onclick = () => {
    const visible = [...windows.values()]
      .some(win => !win.el.hidden);

    windows.forEach(win => {
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
    win.body.replaceChildren(...children);
    win.body.scrollTop = 0;
  }

  /* App collections and details */

  function collection(win, id) {
    win.view = null;

    const description =
      apps.find(app => app[0] === id)?.[2] || 'Portfolio';

    const intro = element(
      'p',
      'app-caption',
      `${description} · Select an item to explore.`
    );

    const grid = element('div', 'collection');

    data[id].forEach((item, index) => {
      const b = button(
        '',
        () => detail(win, id, index),
        'file-card'
      );

      if (item.image) {
        const img = element('img', 'file-preview');
        img.src = item.image;
        img.alt = item.alt;
        img.loading = 'lazy';
        b.append(img);
      } else {
        b.append(
          element(
            'div',
            'file-placeholder',
            id === 'languages' ? '</>' : 'RA'
          )
        );
      }

      const text = element('span', 'file-text');

      text.append(element('strong', '', item.title));

      if (item.subtitle) {
        text.append(element('small', '', item.subtitle));
      }

      if (item.summary) {
        text.append(element('p', '', item.summary));
      }

      text.append(
        element('span', 'open-label', 'Explore details ↗')
      );

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
    win.view = { id, index };

    const item = data[id][index];
    const article = element('article', 'detail');

    article.innerHTML = item.html;

    const back = button(
      '← Back to ' + apps.find(app => app[0] === id)[1],
      () => {
        collection(win, id);
        $('.file-card', win.body)?.focus();
      },
      'back-button'
    );

    all('img', article).forEach((img, imageIndex) => {
      const trigger = button(
        '',
        () => openGallery(
          item.title,
          all('img', article).map(image => ({
            src: image.src,
            alt: image.alt
          })),
          imageIndex
        ),
        'image-button'
      );

      trigger.setAttribute(
        'aria-label',
        'Enlarge ' + img.alt
      );

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

    let index = start;

    function render() {
      const wrap = element('div', 'photo-view');
      const controls = element('div', 'gallery-controls');
      const img = element('img');

      img.src = images[index].src;
      img.alt = images[index].alt;

      const previous = button('←', () => {
        index = (index - 1 + images.length) % images.length;
        render();
      });

      const next = button('→', () => {
        index = (index + 1) % images.length;
        render();
      });

      previous.setAttribute('aria-label', 'Previous image');
      next.setAttribute('aria-label', 'Next image');

      controls.append(
        previous,
        element('span', '', `${index + 1} / ${images.length}`),
        next
      );

      wrap.append(
        controls,
        img,
        element('p', '', img.alt)
      );

      replace(win, [wrap]);
    }

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

  /* Résumé */

  function resume(win) {
    const heading = element('h2', '', 'Résumé');

    const description = element(
      'p',
      '',
      'A closer look at my experience, education, and skills.'
    );

    const actions = element('div');
    const img = element('img', 'resume-preview');

    img.src = 'images/Rahul_Anand_Resume.jpg';
    img.alt = 'Rahul Anand résumé';
    img.loading = 'lazy';

    const download = link(
      'Download PDF',
      'images/Rahul_Anand_Resume.pdf'
    );

    download.download = 'Rahul_Anand_Resume.pdf';

    actions.append(
      link('Open PDF ↗', 'images/Rahul_Anand_Resume.pdf'),
      download
    );

    replace(win, [heading, description, actions, img]);
  }

  /* Contact */

  function contact(win) {
    const heading = element('h2', '', 'Let’s connect');

    const description = element(
      'p',
      '',
      'Interested in collaborating or discussing opportunities?'
    );

    const links = element('div', 'contact-links');

    [
      [
        'Email me',
        'https://mail.google.com/mail/?view=cm&fs=1&to=rahulanandbus@gmail.com',
        'images/gmailIcon.png'
      ],
      [
        'LinkedIn',
        'https://www.linkedin.com/in/rahul-anand-39b214320/',
        'images/linkedinLogo.webp'
      ],
      [
        'GitHub',
        'https://github.com/rahulanandcs?tab=repositories',
        'images/githubIcon.webp'
      ]
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
        await navigator.clipboard.writeText(
          'rahulanandbus@gmail.com'
        );

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
      copy
    ]);
  }

  /* Settings */

  function settings(win) {
    const heading = element(
      'h2',
      '',
      'Make yourself at home'
    );

    const description = element(
      'p',
      'app-caption',
      'Your preferences stay in this browser. Sound always starts muted.'
    );

    function row(title, text, checked, change, id) {
      const label = element('label', 'setting');
      const copy = element('span');
      const input = element('input');

      copy.append(
        element('strong', '', title),
        element('p', '', text)
      );

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
      value => {
        motion = value;
        storage.set('motion', value ? 'on' : 'off');
        syncMotion();
      }
    );

    const soundRow = row(
      'Sound effects',
      'Quiet, synthesized chimes when you explore.',
      sound,
      toggleSound,
      'sound-setting'
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
        'Rahul OS · Portfolio edition 1.0 · No tracking or account required.'
      ),
      reset
    ]);
  }

  /* Search */

  function search(win) {
    const label = element(
      'label',
      '',
      'Find an app, project, skill, or achievement'
    );

    label.htmlFor = 'portfolio-search';

    const input = element('input', 'search-input');
    input.id = 'portfolio-search';
    input.type = 'search';
    input.placeholder = 'Try “React”, “DriveDrop”, or “résumé”…';

    const results = element('div');
    results.setAttribute('aria-live', 'polite');

    const entries = apps.map(([id, name, description]) => ({
      name,
      desc: description,
      id,
      index: null,
      text: name + ' ' + description
    }));

    Object.entries(data).forEach(([id, items]) => {
      items.forEach((item, index) => {
        const doc = new DOMParser().parseFromString(
          item.html,
          'text/html'
        );

        entries.push({
          name: item.title,
          desc: apps.find(app => app[0] === id)[1],
          id,
          index,
          text: doc.body.textContent
        });
      });
    });

    function run() {
      const query = input.value.trim().toLowerCase();

      results.replaceChildren();

      const matches = entries.filter(entry => {
        if (!query) return entry.index === null;

        return (
          entry.text + ' ' + entry.name
        ).toLowerCase().includes(query);
      });

      if (!matches.length) {
        results.append(
          element(
            'p',
            '',
            'No matches. Try a project name or skill.'
          )
        );

        return;
      }

      matches.slice(0, 30).forEach(entry => {
        const b = button(
          '',
          async () => {
            const target = await openApp(entry.id);

            if (target && entry.index !== null) {
              detail(target, entry.id, entry.index);
            }
          },
          'search-result'
        );

        b.append(
          element('strong', '', entry.name),
          element('small', '', entry.desc)
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
      search: 'Search'
    };

    const title =
      apps.find(app => app[0] === id)?.[1] || names[id];

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

    replace(win, [
      element('p', '', 'Opening your portfolio…')
    ]);

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
        element(
          'p',
          '',
          'Could not load the portfolio content.'
        ),
        link(
          'Read the original portfolio',
          'portfolio.html'
        ),
        button('Try again', async () => {
          loading = loadContent();
          loading.catch(() => {});

          closeWindow(win);
          await openApp(id);
        })
      ]);
    }

    return win;
  }

  /* Keyboard shortcuts */

  document.addEventListener('keydown', event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'k'
    ) {
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
      minute: '2-digit'
    });

    $('#clock').dateTime = now.toISOString();

    $('#clock').title = now.toLocaleString([], {
      dateStyle: 'full',
      timeStyle: 'long'
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
    location.hash.slice(1) ||
    new URLSearchParams(location.search).get('tab');

  if (
    !seen &&
    !initial &&
    !reduced.matches &&
    motion
  ) {
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