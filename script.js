const nav = document.querySelector('#mainNav');
const btn = document.querySelector('.menu');

btn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});

document.querySelectorAll('#mainNav a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

const SUPABASE_URL = 'https://chvwxkuawstogkkxoplm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OoJE9LWhmmXp7Ecs5o_NBA_jmrA9d2N';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[m]));
}

function formatDate(s) {
  try {
    return new Date(s + 'T00:00:00').toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch (e) { return s; }
}

async function loadSiteContentPublic() {
  const response = await fetch(
    SUPABASE_URL + '/rest/v1/site_content?select=*&id=eq.1',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }, cache: 'no-store' }
  );
  if (!response.ok) throw new Error('site_content HTTP ' + response.status);
  const rows = await response.json();
  const data = rows[0];
  if (!data) return;
  const setText = (id, value) => { const el = document.getElementById(id); if (el && value) el.textContent = value; };
  const title = document.querySelector('#siteTitle');
  if (title && data.title) title.innerHTML = '“' + esc(data.title).replace(/\n/g, '<br>') + '”';
  setText('siteSubtitle', data.subtitle);
  setText('siteTagline', data.tagline);
  setText('cardChiSiamo', data.chi_siamo);
  setText('cardAttivita', data.attivita);
  setText('siteNews', data.news);
  setText('siteGalleria', data.galleria);
  setText('siteContatti', data.contatti);
}

async function loadGalleryPublic() {
  const response = await fetch(
    SUPABASE_URL + '/rest/v1/gallery?select=*&order=created_at.desc',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }, cache: 'no-store' }
  );
  if (!response.ok) throw new Error('gallery HTTP ' + response.status);
  const photos = await response.json();
  const box = document.querySelector('#galleryPics');
  if (!box) return;
  if (!photos.length) return;
  box.innerHTML = photos.map(p =>
    '<a class="realphoto dynamic-photo" href="' + esc(p.image_url) + '" target="_blank" rel="noopener" aria-label="Apri foto della galleria"><img src="' + esc(p.image_url) + '" alt="Foto della galleria" loading="lazy"></a>'
  ).join('');
  box.addEventListener('click', event => {
    const link = event.target.closest('.dynamic-photo');
    if (!link) return;
    event.preventDefault();
    const overlay = document.createElement('div');
    overlay.className = 'poster-lightbox';
    overlay.innerHTML = '<button class="poster-lightbox-close" aria-label="Chiudi">×</button><img src="' + esc(link.href) + '" alt="Foto della galleria">';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    const close = () => { overlay.remove(); document.body.style.overflow = ''; };
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target.classList.contains('poster-lightbox-close')) close(); });
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } });
  });
}

(async () => {
  try {
    await loadSiteContentPublic();
    await loadGalleryPublic();
  } catch (e) { console.error('Errore caricamento contenuti:', e); }
})();