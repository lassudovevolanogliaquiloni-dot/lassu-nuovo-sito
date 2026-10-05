const nav=document.querySelector('#mainNav');const btn=document.querySelector('.menu');btn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',open)});document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

(async()=>{try{
const r=await fetch('content.json?'+Date.now());const data=await r.json();
if(data.site){
const title=document.querySelector('#siteTitle');const subtitle=document.querySelector('#siteSubtitle');const tagline=document.querySelector('#siteTagline');
if(title&&data.site.title) title.innerHTML='“'+data.site.title.replace(/\\n/g,'<br>')+'”';
if(subtitle&&data.site.subtitle) subtitle.textContent=data.site.subtitle;
if(tagline&&data.site.tagline) tagline.textContent=data.site.tagline;
}
const list=document.querySelector('#eventList');
if(list&&Array.isArray(data.events)&&data.events.length){
list.innerHTML=data.events.map(e=>`<article><h3>${e.title||''}</h3><p>${e.description||''}</p></article>`).join('')
}
}catch(e){}})();