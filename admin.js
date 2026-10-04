const $=s=>document.querySelector(s);
const seedEvents=[
{id:1,title:'Festa degli Aquiloni',date:'2026-05-25',place:'Spiaggia di Marina di Camerota',description:'Una giornata dedicata agli aquiloni e alla condivisione.'},
{id:2,title:'Laboratorio Costruisci il tuo aquilone',date:'2026-06-15',place:'Parco Comunale',description:'Laboratorio creativo per costruire e decorare il proprio aquilone.'},
{id:3,title:'Aquiloni al tramonto',date:'2026-07-06',place:'Belvedere di San Mauro',description:'Un appuntamento speciale al tramonto.'},
{id:4,title:"Festa d'Autunno",date:'2026-09-27',place:'Piazza del Comune',description:'Musica, socialità e attività per tutte le età.'}];
const get=(k,f)=>JSON.parse(localStorage.getItem(k)||'null')??f;
let events=get('aquiloni_events',seedEvents), news=get('aquiloni_news',[{id:1,title:'Benvenuti nel nuovo sito',date:'2026-01-01',place:'',description:'Il sito dell’associazione è online.'}]), messages=get('aquiloni_messages',[]);
function save(){localStorage.setItem('aquiloni_events',JSON.stringify(events));localStorage.setItem('aquiloni_news',JSON.stringify(news));localStorage.setItem('aquiloni_messages',JSON.stringify(messages));}
function render(){
  $('#eventCount').textContent=events.length;$('#newsCount').textContent=news.length;$('#messageCount').textContent=messages.length;
  $('#eventsList').innerHTML=events.length?events.map(x=>item(x,'event')).join(''):'<div class="empty">Nessun evento.</div>';
  $('#newsList').innerHTML=news.length?news.map(x=>item(x,'news')).join(''):'<div class="empty">Nessuna novità.</div>';
  $('#messagesList').innerHTML=messages.length?messages.map((x,i)=>`<div class="item"><div><h3>${esc(x.nome)} — ${esc(x.email)}</h3><p>${esc(x.messaggio)}</p></div><button class="delete" onclick="deleteMessage(${i})">Elimina</button></div>`).join(''):'<div class="empty">Nessun messaggio.</div>';
}
function item(x,type){return `<div class="item"><div><h3>${esc(x.title)}</h3><p>${x.date||''}${x.place?' · '+esc(x.place):''}</p><p>${esc(x.description||'')}</p></div><button onclick="editItem('${type}',${x.id})">Modifica</button><button class="delete" onclick="deleteItem('${type}',${x.id})">Elimina</button></div>`}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function openModal(type,id=null){const list=type==='event'?events:news;const x=id?list.find(a=>a.id===id):null;$('#itemType').value=type;$('#itemId').value=id||'';$('#modalTitle').textContent=(id?'Modifica ':'Nuova ')+(type==='event'?'evento':'novità');$('#title').value=x?.title||'';$('#date').value=x?.date||'';$('#place').value=x?.place||'';$('#description').value=x?.description||'';$('#modal').classList.remove('hidden')}
window.editItem=(type,id)=>openModal(type,id);
window.deleteItem=(type,id)=>{if(!confirm('Eliminare questo elemento?'))return;const list=type==='event'?events:news;const i=list.findIndex(x=>x.id===id);if(i>=0)list.splice(i,1);save();render()};
window.deleteMessage=i=>{messages.splice(i,1);save();render()};
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();if($('#user').value==='admin'&&$('#pass').value==='aquiloni2026'){sessionStorage.setItem('aquiloni_admin','1');showApp()}else alert('Credenziali demo non corrette.')});
function showApp(){if(sessionStorage.getItem('aquiloni_admin')==='1'){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');render()}}
$('#logout').onclick=()=>{sessionStorage.removeItem('aquiloni_admin');location.reload()};
$('#newEvent').onclick=()=>openModal('event');$('#newNews').onclick=()=>openModal('news');$('#closeModal').onclick=()=>$('#modal').classList.add('hidden');$('#cancel').onclick=()=>$('#modal').classList.add('hidden');
$('#clearMessages').onclick=()=>{if(confirm('Svuotare tutti i messaggi?')){messages=[];save();render()}};
$('#itemForm').addEventListener('submit',e=>{e.preventDefault();const type=$('#itemType').value,list=type==='event'?events:news,id=Number($('#itemId').value);const data={id:id||Date.now(),title:$('#title').value,date:$('#date').value,place:$('#place').value,description:$('#description').value};if(id){const i=list.findIndex(x=>x.id===id);list[i]=data}else list.push(data);save();$('#modal').classList.add('hidden');render()});
showApp();
