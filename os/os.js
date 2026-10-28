'use strict';
(() => {
  const apps = [
    ['internships','Internships','Industry experience'],['projects','Projects / Clubs','Things I’ve built'],
    ['languages','Languages / Certs','Skills & achievements'],['design','Graphic Design','Visual explorations'],
    ['highschool','High School','Where it started'],['about','About Me','The person behind the work'],
    ['resume','Résumé','The essentials, in one place'],['contact','Contact','Let’s connect']
  ];
  const $ = (s, root=document) => root.querySelector(s);
  const all = (s, root=document) => [...root.querySelectorAll(s)];
  const element = (tag, cls, text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const button = (text, action, cls='') => {const b=element('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
  const storage = {get(key){try{return localStorage.getItem('rahul-os-'+key);}catch{return null;}},set(key,val){try{localStorage.setItem('rahul-os-'+key,val);}catch{}}};
  let sound=false, audio, z=1000, data={}, loaded=false, loading;
  const windows=new Map(), media=matchMedia('(max-width:700px)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let motion=storage.get('motion')!=='off';
  const syncMotion=()=>document.body.classList.toggle('reduced-motion',!motion || reduced.matches);
  syncMotion();reduced.addEventListener('change',syncMotion);
  function chime(){
    if(!sound)return;
    try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const now=audio.currentTime;
      [660,880].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,now+i*.045);g.gain.linearRampToValueAtTime(.035,now+i*.045+.015);g.gain.exponentialRampToValueAtTime(.001,now+i*.045+.16);o.connect(g);g.connect(audio.destination);o.start(now+i*.045);o.stop(now+i*.045+.18);});
    }catch{/* Audio is optional. */}
  }
  function toggleSound(value){sound=value;$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Mute sound effects':'Enable sound effects');const input=$('#sound-setting');if(input)input.checked=sound;chime();}
  $('#sound').onclick=()=>toggleSound(!sound);
  // Set any src to your own individual image; null keeps the original icon.
  const appIcons = {
    internships: {src:null, scale:1, position:'50% 50%'},
    projects:    {src:null, scale:1, position:'50% 50%'},
    languages:   {src:null, scale:1, position:'50% 50%'},
    design:      {src:null, scale:1, position:'50% 50%'},
    highschool:  {src:null, scale:1, position:'50% 50%'},
    about:       {src:null, scale:1, position:'50% 50%'},
    resume:      {src:null, scale:1, position:'50% 50%'},
    contact:     {src:null, scale:1, position:'50% 50%'}
  };
  function icon(index) {
    const config=appIcons[apps[index][0]], art=element('span','app-art');
    art.setAttribute('aria-hidden','true');
    if(config.src){
      art.classList.add('individual-icon');
      const img=element('img');img.src=config.src;img.alt='';
      img.style.objectPosition=config.position;img.style.transform=`scale(${config.scale})`;
      art.append(img);
    }else{
      art.style.setProperty('--x',`${index%4*100/3}%`);
      art.style.setProperty('--y',index<4?'0%':'100%');
    }
    return art;
  }
  apps.forEach(([id,name,desc],i)=>{const b=button('',()=>openApp(id),'app-button');b.dataset.appId=id;b.setAttribute('aria-label',`Open ${name}`);b.append(icon(i),element('strong','',name),element('small','',desc));$(i<5?'#work-apps':'#personal-apps').append(b);});
  all('[data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app));
  function sanitize(node){
    const copy=node.cloneNode(true);
    all('script,button',copy).forEach(e=>e.remove());
    [copy,...all('*',copy)].forEach(e=>{[...e.attributes].forEach(a=>{if(a.name.startsWith('on')||['id','style'].includes(a.name))e.removeAttribute(a.name);});
      if(e.tagName==='A'){e.rel='noopener noreferrer';if(/^javascript:/i.test(e.getAttribute('href')||''))e.removeAttribute('href');}
      if(e.tagName==='IMG'){e.loading='lazy';e.decoding='async';}
      if(e.tagName==='VIDEO'){e.removeAttribute('autoplay');e.controls=true;e.preload='none';}
    });return copy;
  }
  async function loadContent(){
    $('#load-error').hidden=true;
    try{
      const sources=await Promise.all(['portfolio.html','profile.html'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error('Content unavailable');return new DOMParser().parseFromString(await r.text(),'text/html');}));
      const [work,profile]=sources;
      const card=node=>{const safe=sanitize(node);return {title:$('h2,h3',safe)?.textContent.trim()||'Details',subtitle:$('.cyber-subtitle,.card-tag',safe)?.textContent.trim()||'',html:safe.innerHTML,summary:$('p',safe)?.textContent||'',image:$('img',safe)?.getAttribute('src')||'',alt:$('img',safe)?.alt||''};};
      apps.slice(0,5).forEach(([id])=>{const section=$('#'+id,work);if(!section)throw Error('Missing category');data[id]=[...section.children].filter(e=>e.classList.contains('y2k-card')).flatMap(e=>e.classList.contains('carousel-section-card')?all('.carousel-card-3d',e).map(card):[card(e)]);});
      data.projects[0].html+='<img src="images/CGmascotLeft!.png" alt="CodeGana mascot" loading="lazy">';
      data.about=all('.about-section',profile).map(card);
      loaded=true;
    }catch(e){loaded=false;$('#load-error').hidden=false;throw e;}
  }
  loading=loadContent();loading.catch(()=>{});
  $('#retry').onclick=()=>{loading=loadContent();loading.catch(()=>{});};
  function announce(text){$('#announcement').textContent=text;}
  function focusWindow(win){
    for(const w of windows.values()){w.el.classList.remove('focused');w.task.classList.remove('task-active');}
    win.el.hidden=false;win.el.style.zIndex=++z;win.el.classList.add('focused');win.task.classList.add('task-active');win.task.setAttribute('aria-pressed','true');
    for(const w of windows.values())if(w!==win)w.task.setAttribute('aria-pressed','false');
  }
  function foreground(){return [...windows.values()].filter(w=>!w.el.hidden).sort((a,b)=>Number(b.el.style.zIndex)-Number(a.el.style.zIndex))[0];}
  function returnFocus(win){if(win.opener?.isConnected)win.opener.focus();else $('#show-desktop').focus();}
  function pause(win){all('video',win.body).forEach(v=>v.pause());}
  function closeWindow(win){pause(win);win.el.remove();win.task.remove();windows.delete(win.id);all(`[data-app-id="${win.id}"]`).forEach(b=>b.dataset.open='false');const next=foreground();if(next){focusWindow(next);next.el.focus();}else returnFocus(win);announce(`${win.title} closed`);}
  function minimize(win){pause(win);win.el.hidden=true;win.task.classList.remove('task-active');win.task.setAttribute('aria-pressed','false');const next=foreground();if(next){focusWindow(next);next.el.focus();}else returnFocus(win);}
  function fitWindow(win, center=false) {
    const top=$('.system-bar').getBoundingClientRect().bottom+10;
    const bottom=$('.dock').getBoundingClientRect().top-12;
    const available=Math.max(120,bottom-top), gap=media.matches?6:16;
    const full=media.matches||win.el.classList.contains('maximized');
    const width=full?innerWidth-gap*2:Math.min(1000,innerWidth-gap*2);
    const height=full?available:Math.min(760,available);
    const r=win.el.getBoundingClientRect();
    Object.assign(win.el.style,{
      width:width+'px',height:height+'px',
      left:(center||full?(innerWidth-width)/2:Math.max(gap,Math.min(r.left,innerWidth-width-gap)))+'px',
      top:(center||full?top+(available-height)/2:Math.max(top,Math.min(r.top,bottom-height)))+'px'
    });
  }
  function clamp(win){fitWindow(win);}
  function newWindow(id,title){
    const el=element('section','window');el.tabIndex=-1;el.setAttribute('role','dialog');el.setAttribute('aria-label',title);
    const bar=element('div','titlebar'),heading=element('h2','',title),controls=element('div','window-controls'),body=element('div','window-body');
    const win={id,title,el,body,opener:document.activeElement,view:null};
    const min=button('−',()=>minimize(win)),max=button('□',()=>{el.classList.toggle('maximized');max.setAttribute('aria-label',el.classList.contains('maximized')?'Restore window':'Maximize window');clamp(win);}),close=button('×',()=>closeWindow(win));
    min.setAttribute('aria-label','Minimize '+title);max.setAttribute('aria-label','Maximize window');close.setAttribute('aria-label','Close '+title);controls.append(min,max,close);bar.append(heading,controls);el.append(bar,body);$('#windows').append(el);
    fitWindow(win,true);
    win.task=button(title,()=>{focusWindow(win);el.focus();});win.task.setAttribute('aria-label','Restore or focus '+title);$('#tasks').append(win.task);windows.set(id,win);
    all(`[data-app-id="${id}"]`).forEach(b=>b.dataset.open='true');
    el.addEventListener('pointerdown',()=>focusWindow(win));el.addEventListener('focusin',()=>{if(!el.classList.contains('focused'))focusWindow(win);});
    let drag;
    bar.onpointerdown=e=>{if(media.matches||e.target.closest('button')||el.classList.contains('maximized')||e.button!==0)return;const r=el.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};bar.setPointerCapture(e.pointerId);};
    bar.onpointermove=e=>{if(!drag)return;el.style.left=Math.max(6,Math.min(e.clientX-drag.x,innerWidth-el.offsetWidth-6))+'px';el.style.top=(e.clientY-drag.y)+'px';clamp(win);};
    bar.onpointerup=bar.onpointercancel=()=>drag=null;
    bar.ondblclick=e=>{if(!media.matches&&!e.target.closest('button'))max.click();};
    focusWindow(win);fitWindow(win,true);el.focus();chime();announce(title+' opened');return win;
  }
  addEventListener('resize',()=>windows.forEach(clamp));
  $('#show-desktop').onclick=()=>{const visible=[...windows.values()].some(w=>!w.el.hidden);windows.forEach(w=>{if(visible)minimize(w);else focusWindow(w);});$('#show-desktop').focus();};
  function replace(win,children){pause(win);win.body.replaceChildren(...children);win.body.scrollTop=0;}
  function source(item){const root=element('div');root.innerHTML=item.html;return root;}
  function photoList(root){return all('img',root).map(img=>({src:img.getAttribute('src'),alt:img.alt}));}
  function artImage(src,alt,cls=''){const img=element('img',cls);img.src=src;img.alt=alt;img.loading='lazy';return img;}
  function itemStyle(item){
    if(/codegana/i.test(item.title))return 'codegana';
    if(/drivedrop/i.test(item.title))return 'drivedrop';
    return '';
  }
  function collection(win,id){
    if(id==='about'){aboutExperience(win);return;}
    if(id==='languages'){techExperience(win);return;}
    win.el.classList.remove('gallery-window');
    const grid=element('div','collection poster-collection');
    data[id].forEach((item,index)=>{
      const tile=button('',()=>detail(win,id,index),'file-card poster-tile '+itemStyle(item));
      const art=element('span','tile-art');
      if(/drivedrop/i.test(item.title)){
        art.append(element('span','brand-word','DriveDrop'),artImage('images/drivedrop-grand-cherokee-blue.png','DriveDrop vehicle'));
      }else if(/codegana/i.test(item.title)){
        art.append(artImage('images/codeganaLogoWide.png','CodeGana','tile-logo'),artImage('images/CGmascotLeft!.png','CodeGana mascot','tile-mascot'));
      }else if(item.image){art.append(artImage(item.image,item.alt));}
      else art.append(element('span','brand-word',item.title));
      const text=element('span','file-text');
      text.append(element('small','',`${String(index+1).padStart(2,'0')} / ${item.subtitle||apps.find(a=>a[0]===id)[1]}`),element('strong','',item.title));
      if(item.summary)text.append(element('p','',item.summary));
      text.append(element('span','open-label','Explore the story ↗'));
      tile.append(art,text);grid.append(tile);
    });
    replace(win,[element('p','app-caption','Select a story to explore the work, images, and details.'),grid]);
  }
  function detail(win,id,index){
    const item=data[id][index];
    if(/Instagram Photography/i.test(item.title)){photography(win,id,index);return;}
    win.view={id,index};
    const root=source(item), photos=photoList(root);
    const poster=element('article','story-poster '+itemStyle(item));
    const header=element('header','story-header');
    header.append(element('span','story-kicker',item.subtitle||apps.find(a=>a[0]===id)[1]),element('h2','story-title',item.title));
    const hero=element('div','story-hero');
    let heroSrc=photos[0]?.src;
    if(/codegana/i.test(item.title))heroSrc='images/CGScreenshot.png';
    if(/drivedrop/i.test(item.title))heroSrc='images/drivedrop-grand-cherokee-blue.png';
    if(heroSrc){
      const heroIndex=Math.max(0,photos.findIndex(p=>p.src===heroSrc));
      const trigger=button('',()=>openGallery(item.title,photos,heroIndex),'hero-image');
      trigger.setAttribute('aria-label','Enlarge '+item.title+' image');
      trigger.append(artImage(heroSrc,item.title));hero.append(trigger);
    }
    const heading=$('h2,h3',root);if(heading)heading.remove();
    all('.floating-badge,.cyber-subtitle',root).forEach(el=>el.remove());
    const mediaPanel=element('div','story-media');
    all('img,video',root).forEach(media=>{
      if(media.tagName==='IMG'){
        const i=photos.findIndex(p=>p.src===media.getAttribute('src'));
        const b=button('',()=>openGallery(item.title,photos,i),'image-button');
        b.setAttribute('aria-label','Enlarge '+media.alt);b.append(media);mediaPanel.append(b);
      }else{media.controls=true;media.removeAttribute('autoplay');mediaPanel.append(media);}
    });
    root.className='story-copy';
    const body=element('div','story-layout');body.append(root,mediaPanel);
    poster.append(header,hero,body);
    const back=button('← Back to '+apps.find(a=>a[0]===id)[1],()=>collection(win,id),'back-button');
    replace(win,[back,poster]);back.focus();chime();
  }
  function openGallery(title,images,start){
    if(!images.length)return;
    const win=windows.get('gallery')||newWindow('gallery','Image viewer');
    win.el.classList.add('gallery-window');focusWindow(win);
    let index=Math.max(0,start),touchX=null;
    const stage=element('div','gallery-stage'),img=element('img');
    const caption=element('p','gallery-caption');caption.setAttribute('aria-live','polite');
    function show(delta=0){index=(index+delta+images.length)%images.length;img.src=images[index].src;img.alt=images[index].alt;caption.textContent=`${index+1} / ${images.length} · ${img.alt}`;}
    const prev=button('←',()=>show(-1),'gallery-prev'),next=button('→',()=>show(1),'gallery-next');
    prev.setAttribute('aria-label','Previous image');next.setAttribute('aria-label','Next image');
    stage.append(prev,img,next,caption);replace(win,[stage]);show();
    win.el.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(e.key==='ArrowLeft'?-1:1);}};
    stage.ontouchstart=e=>touchX=e.changedTouches[0].clientX;
    stage.ontouchend=e=>{const distance=e.changedTouches[0].clientX-touchX;if(Math.abs(distance)>50)show(distance<0?1:-1);};
    win.el.focus();
  }
  function photography(win,id,index){
    const item=data[id][index],photos=photoList(source(item));
    const toolbar=element('div','photo-filters'),grid=element('div','travel-grid');
    function render(category){
      const filtered=photos.filter(p=>category==='All'||p.alt.toLowerCase().includes(category.toLowerCase()));
      grid.replaceChildren();
      all('button',toolbar).forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===category)));
      filtered.forEach((p,i)=>{const b=button('',()=>openGallery(item.title,filtered,i),'travel-photo');b.setAttribute('aria-label','View '+p.alt);b.append(artImage(p.src,p.alt),element('span','',p.alt));grid.append(b);});
    }
    ['All','Japan','India'].forEach(label=>toolbar.append(button(label,()=>render(label))));
    replace(win,[button('← Back to Graphic Design',()=>collection(win,id),'back-button'),element('h2','story-title','Through my lens.'),element('p','','Snapshots from travels across the world and artistic photos.'),toolbar,grid]);render('All');
  }
  function techExperience(win){
    const skills=source(data.languages[0]),certs=source(data.languages[1]);
    const iconNames={Java:'java',Python:'python','C++':'cplusplus',TypeScript:'typescript',React:'react',FastAPI:'fastapi',OpenCV:'opencv',Firebase:'firebase',Selenium:'selenium',Flask:'flask',Swift:'swift','HTML / CSS':'html5'};
    const wrap=element('div','tech-studio'),rail=element('div','tech-wheel');rail.tabIndex=0;rail.setAttribute('aria-label','Technology wheel. Scroll horizontally to browse.');
    const controls=element('div','wheel-controls');
    controls.append(button('← Previous',()=>rail.scrollBy({left:-250,behavior:motion&&!reduced.matches?'smooth':'auto'})),button('Next →',()=>rail.scrollBy({left:250,behavior:motion&&!reduced.matches?'smooth':'auto'})));
    all('.skill-tag',skills).forEach(tag=>{
      const name=tag.textContent.trim(),tile=element('div','tech-tile');
      const slug=iconNames[name];
      if(slug){const img=artImage(`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/${slug}/${slug}-original.svg`,'');img.onerror=()=>img.remove();tile.append(img);}
      tile.append(element('strong','',name));rail.append(tile);
    });
    const timeline=element('ol','credential-timeline');
    all('li',certs).forEach((li,i)=>{
      const entry=element('li'),marker=element('span','credential-number',String(i+1).padStart(2,'0'));
      const content=element('div');content.innerHTML=li.innerHTML;
      if(i===0)content.append(artImage('images/neuralseek_Image.jpeg','NeuralSeek certification'));
      if(/TechMeKid/i.test(li.textContent))content.append(artImage('images/TMKIntern.jpeg','TechMeKid internship certificate'));
      entry.append(marker,content);timeline.append(entry);
    });
    wrap.append(element('span','story-kicker','Languages / Certifications'),element('h2','story-title','Tools to turn ideas into reality.'),controls,rail);
    all('p',skills).forEach(p=>wrap.append(p));
    wrap.append(element('h3','credential-heading','Recognition & milestones'),element('p','app-caption','Certifications, academic honors, and recognition.'),timeline);
    replace(win,[wrap]);
  }
  function aboutExperience(win){
    const page=element('article','about-editorial'),hero=element('div','about-composition');
    const title=element('div','about-name');title.append(element('span','story-kicker','The person behind the work'),element('h2','','Rahul'),element('h2','','Anand.'));
    const portrait=artImage('images/IMG_1180.JPG','Rahul Anand','editorial-portrait');
    hero.append(title,portrait,element('span','about-sticker','CS @ TEXAS A&M'));
    const tabs=element('nav','about-chapters');tabs.setAttribute('aria-label','About Me chapters');
    const chapter=element('section','about-chapter');
    function show(index){
      all('button',tabs).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      chapter.replaceChildren();const text=source(data.about[index]);text.className='chapter-content';chapter.append(text);
    }
    ['Snapshot','Experience','Toolkit','Beyond the code'].forEach((name,i)=>tabs.append(button(name,()=>show(i))));
    page.append(hero,tabs,chapter);replace(win,[page]);show(0);
  }
  function link(label,url,cls='pill'){const a=element('a',cls,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  function resume(win){const h=element('h2','','Résumé'),p=element('p','','A closer look at my experience, education, and skills.'),actions=element('div'),img=element('img','resume-preview');img.src='images/Rahul_Anand_Resume.jpg';img.alt='Rahul Anand résumé';img.loading='lazy';const download=link('Download PDF','images/Rahul_Anand_Resume.pdf');download.download='Rahul_Anand_Resume.pdf';actions.append(link('Open PDF ↗','images/Rahul_Anand_Resume.pdf'),download);replace(win,[h,p,actions,img]);}
  function contact(win){
    const h=element('h2','','Let’s connect'),p=element('p','','Interested in collaborating or discussing opportunities?'),links=element('div','contact-links');
    [['Email me','https://mail.google.com/mail/?view=cm&fs=1&to=rahulanandbus@gmail.com','images/gmailIcon.png'],['LinkedIn','https://www.linkedin.com/in/rahul-anand-39b214320/','images/linkedinLogo.webp'],['GitHub','https://github.com/rahulanandcs?tab=repositories','images/githubIcon.webp']].forEach(([name,url,src])=>{const a=link(name,url,'');const img=element('img');img.src=src;img.alt='';a.prepend(img);links.append(a);});
    const copy=button('Copy email address',async()=>{try{await navigator.clipboard.writeText('rahulanandbus@gmail.com');copy.textContent='Email copied';}catch{copy.textContent='rahulanandbus@gmail.com';}announce(copy.textContent);});replace(win,[h,p,links,element('p','','rahulanandbus@gmail.com'),copy]);
  }
  function settings(win){
    const h=element('h2','','Make yourself at home'),p=element('p','app-caption','Your preferences stay in this browser. Sound always starts muted.');
    function row(title,text,checked,change,id){const l=element('label','setting'),copy=element('span'),input=element('input');copy.append(element('strong','',title),element('p','',text));input.type='checkbox';input.checked=checked;if(id)input.id=id;input.onchange=()=>change(input.checked);l.append(copy,input);return l;}
    const motionRow=row('Expressive motion',reduced.matches?'Your system requests reduced motion; that preference takes priority.':'Window transitions and playful hover effects.',motion,v=>{motion=v;storage.set('motion',v?'on':'off');syncMotion();});
    const soundRow=row('Sound effects','Quiet, synthesized chimes when you explore.',sound,toggleSound,'sound-setting');
    const reset=button('Reset preferences',()=>{motion=true;storage.set('motion','on');toggleSound(false);syncMotion();settings(win);});
    replace(win,[h,p,motionRow,soundRow,element('p','app-caption','Rahul OS · Portfolio edition 1.0 · No tracking or account required.'),reset]);
  }
  function search(win){
    const label=element('label','','Find an app, project, skill, or achievement');label.htmlFor='portfolio-search';const input=element('input','search-input');input.id='portfolio-search';input.type='search';input.placeholder='Try “React”, “DriveDrop”, or “résumé”…';const results=element('div');results.setAttribute('aria-live','polite');
    const entries=apps.map(([id,name,desc])=>({name,desc,id,index:null,text:name+' '+desc}));
    Object.entries(data).forEach(([id,items])=>items.forEach((item,index)=>{const doc=new DOMParser().parseFromString(item.html,'text/html');entries.push({name:item.title,desc:apps.find(a=>a[0]===id)[1],id,index,text:doc.body.textContent});}));
    function run(){const q=input.value.trim().toLowerCase();results.replaceChildren();const matches=entries.filter(e=>!q?e.index===null:(e.text+' '+e.name).toLowerCase().includes(q));if(!matches.length){results.append(element('p','','No matches. Try a project name or skill.'));return;}matches.slice(0,30).forEach(e=>{const b=button('',async()=>{const target=await openApp(e.id);if(target&&e.index!==null)detail(target,e.id,e.index);},'search-result');b.append(element('strong','',e.name),element('small','',e.desc));results.append(b);});}
    input.oninput=run;replace(win,[label,input,results]);run();input.focus();
  }
  async function openApp(id){
    const names={settings:'Settings',search:'Search'};const title=apps.find(a=>a[0]===id)?.[1]||names[id];if(!title)return;
    let win=windows.get(id);if(win){focusWindow(win);win.el.focus();return win;}
    win=newWindow(id,title);
    if(id==='settings'){settings(win);return win;}if(id==='resume'){resume(win);return win;}if(id==='contact'){contact(win);return win;}
    replace(win,[element('p','','Opening your portfolio…')]);
    try{if(!loaded)await loading;if(!windows.has(id))return;if(id==='search')search(win);else collection(win,id);}catch{replace(win,[element('p','','Could not load the portfolio content.'),link('Read the original portfolio','portfolio.html'),button('Try again',async()=>{loading=loadContent();loading.catch(()=>{});closeWindow(win);await openApp(id);})]);}
    return win;
  }
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openApp('search');}
    if(e.key==='Escape'){if(!$('#boot').hidden){dismissBoot();return;}const win=foreground();if(win){e.preventDefault();closeWindow(win);}}
  });
  function clock(){const now=new Date();$('#clock').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});$('#clock').dateTime=now.toISOString();$('#clock').title=now.toLocaleString([],{dateStyle:'full',timeStyle:'long'});}
  clock();setInterval(clock,30000);
  let bootTimer;function dismissBoot(){clearTimeout(bootTimer);$('#boot').hidden=true;try{sessionStorage.setItem('rahul-os-boot','1');}catch{}}
  $('#skip-boot').onclick=dismissBoot;
  let seen=false;try{seen=sessionStorage.getItem('rahul-os-boot')==='1';}catch{}
  const initial=location.hash.slice(1)||new URLSearchParams(location.search).get('tab');
  if(!seen&&!initial&&!reduced.matches&&motion){$('#boot').hidden=false;bootTimer=setTimeout(dismissBoot,1100);}
  if(initial)openApp(initial);
  addEventListener('hashchange',()=>openApp(location.hash.slice(1)));
})();
