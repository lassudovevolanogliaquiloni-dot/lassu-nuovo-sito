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
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

function formatDate(s) {
  try {
    return new Date(s + 'T00:00:00').toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch (e) { return s; }
}

(async () => {
  try {
    const r = await fetch('content.json?' + Date.now());
    const data = await r.json();

    if (data.site) {
      const title = document.querySelector('#siteTitle');
      const subtitle = document.querySelector('#siteSubtitle');
      const tagline = document.querySelector('#siteTagline');
      if (title && data.site.title) title.innerHTML = '“' + data.site.title.replace(/\n/g, '<br>') + '”';
      if (subtitle && data.site.subtitle) subtitle.textContent = data.site.subtitle;
      if (tagline && data.site.tagline) tagline.textContent = data.site.tagline;
    }

    const list = document.querySelector('#eventList');
    if (list) {
      const response = await fetch(
        SUPABASE_URL + '/rest/v1/events?select=*&published=eq.true&order=event_date.asc',
        {
          method: 'GET',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + SUPABASE_KEY,
            Accept: 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Supabase HTTP ' + response.status + ': ' + await response.text());
      }

      const events = await response.json();

      if (Array.isArray(events) && events.length) {
        list.innerHTML = events.map(e =>
          '<article>' +
            (e.poster_url
              ? '<a class="event-poster-link" href="' + esc(e.poster_url) + '" target="_blank" rel="noopener" aria-label="Apri la locandina di ' + esc(e.title) + '"><img class="event-poster" src="' + esc(e.poster_url) + '" alt="Locandina di ' + esc(e.title) + '" loading="lazy"></a>'
              : '') +
            '<h3>' + esc(e.title) + '</h3>' +
            (e.event_date
              ? '<p><strong>' + formatDate(e.event_date) + '</strong>' +
                (e.place ? ' · ' + esc(e.place) : '') +
                '</p>'
              : '') +
            '<p>' + esc(e.description || '') + '</p>' +
          '</article>'
        ).join('');
      }
    }
  } catch (e) {
    console.error('Errore caricamento contenuti:', e);
  }
})();