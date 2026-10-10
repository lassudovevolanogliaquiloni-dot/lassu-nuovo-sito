const client = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);

const $ = id => document.getElementById(id);
let editingId = null;
let currentPosterUrl = null;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[m]));
}

function showApp(email) {
  $('login').classList.add('hidden');
  $('resetPassword').classList.add('hidden');
  $('app').classList.remove('hidden');
  $('userEmail').textContent = email ? ' · ' + email : '';
  loadEvents();
  loadSiteContent();
  loadGallery();
}

function showLogin() {
  $('app').classList.add('hidden');
  $('resetPassword').classList.add('hidden');
  $('login').classList.remove('hidden');
}

async function loadEvents() {
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    $('eventsList').innerHTML =
      '<div class="empty">Errore nel caricamento: ' +
      esc(error.message) +
      '</div>';
    return;
  }

  $('eventCount').textContent = data.length;

  $('eventsList').innerHTML = data.length
    ? data.map(e => `
      <div class="item">
        <div>
          <h3>${esc(e.title)}</h3>
          <p>
            ${esc(e.event_date || '')}
            ${e.place ? ' · ' + esc(e.place) : ''}
            ${e.published ? '' : ' · NON PUBBLICATO'}
          </p>
          <p>${esc(e.description || '')}</p>
          ${e.poster_url ? '<img class="admin-poster-thumb" src="' + esc(e.poster_url) + '" alt="Locandina">' : ''}
        </div>

        <button onclick="editEvent('${e.id}')">
          Modifica
        </button>

        <button class="delete"
                onclick="deleteEvent('${e.id}')">
          Elimina
        </button>
      </div>
    `).join('')
    : '<div class="empty">Nessun evento.</div>';
}

async function loadSiteContent() {
  const { data, error } = await client.from('site_content').select('*').eq('id', 1).single();
  if (error) {
    $('contentMessage').textContent = 'Errore contenuti: ' + error.message;
    return;
  }
  $('contentTitle').value = data.title || 'Lassù dove Volano gli Aquiloni';
  $('contentSubtitle').value = data.subtitle || 'Giovanni per Sempre';
  $('contentTagline').value = data.tagline || 'Insieme per la cultura, la solidarietà e la bellezza delle piccole grandi cose.';
  $('contentChiSiamo').value = data.chi_siamo || 'Una realtà nata dal cuore di persone che credono nei valori della solidarietà, della cultura e del territorio.';
  $('contentAttivita').value = data.attivita || 'Laboratori, iniziative culturali, progetti educativi e momenti di condivisione per tutte le età.';
  $('contentNews').value = data.news || 'News, aggiornamenti e nuove iniziative dell’Associazione.';
  $('contentGalleria').value = data.galleria || 'Scatti, emozioni e sorrisi delle nostre attività e dei nostri eventi.';
  $('contentContatti').value = data.contatti || 'Per informazioni, collaborazioni o per proporre nuove idee, puoi contattarci via email o seguirci sui nostri social.';
}

$('siteContentForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('contentMessage').textContent = 'Salvataggio…';
  const payload = {
    title: $('contentTitle').value.trim(),
    subtitle: $('contentSubtitle').value.trim(),
    tagline: $('contentTagline').value.trim(),
    chi_siamo: $('contentChiSiamo').value.trim(),
    attivita: $('contentAttivita').value.trim(),
    news: $('contentNews').value.trim(),
    galleria: $('contentGalleria').value.trim(),
    contatti: $('contentContatti').value.trim(),
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from('site_content').update(payload).eq('id', 1);
  $('contentMessage').textContent = error ? 'Errore: ' + error.message : 'Contenuti salvati.';
});

async function loadGallery() {
  const { data, error } = await client.from('gallery').select('*').order('created_at', { ascending: false });
  if (error) {
    $('galleryMessage').textContent = 'Errore galleria: ' + error.message;
    return;
  }
  $('adminGallery').innerHTML = data.length ? data.map(item => `
    <div class="admin-gallery-item">
      <img src="${esc(item.image_url)}" alt="Foto galleria">
      <button type="button" class="delete" onclick="deleteGalleryImage('${item.id}', '${esc(item.image_url)}')">Elimina</button>
    </div>
  `).join('') : '<div class="empty">Nessuna foto caricata.</div>';
}

$('uploadGallery').onclick = async () => {
  const files = Array.from($('galleryFiles').files || []);
  if (!files.length) {
    $('galleryMessage').textContent = 'Seleziona almeno una foto.';
    return;
  }
  const section = ($('gallerySection')?.value || '').trim() || 'Generale';
  const slug = section.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'generale';
  $('galleryMessage').textContent = 'Caricamento foto…';
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = 'gallery/' + slug + '/' + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + '.' + extension;
    const upload = await client.storage.from('gallery').upload(path, file, { cacheControl: '31536000', upsert: false });
    if (upload.error) {
      $('galleryMessage').textContent = 'Errore caricamento: ' + upload.error.message;
      return;
    }
    const imageUrl = client.storage.from('gallery').getPublicUrl(path).data.publicUrl;
    const insert = await client.from('gallery').insert({ image_url: imageUrl });
    if (insert.error) {
      $('galleryMessage').textContent = 'Errore salvataggio foto: ' + insert.error.message;
      return;
    }
  }
  $('galleryFiles').value = '';
  if ($('gallerySection')) $('gallerySection').value = '';
  $('galleryMessage').textContent = 'Foto caricate nella sezione “' + section + '”.';
  loadGallery();
};

window.deleteGalleryImage = async (id, imageUrl) => {
  if (!confirm('Eliminare questa foto dalla galleria?')) return;
  const marker = '/gallery/';
  const index = imageUrl.indexOf(marker);
  if (index >= 0) {
    const path = imageUrl.substring(index + marker.length).split('?')[0];
    await client.storage.from('gallery').remove([path]);
  }
  const { error } = await client.from('gallery').delete().eq('id', id);
  if (error) {
    $('galleryMessage').textContent = 'Errore: ' + error.message;
    return;
  }
  loadGallery();
};

window.editEvent = async id => {
  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  editingId = id;

  $('modalTitle').textContent = 'Modifica evento';
  $('title').value = data.title || '';
  $('date').value = data.event_date || '';
  $('place').value = data.place || '';
  $('description').value = data.description || '';
  $('published').checked = !!data.published;
  $('poster').value = '';
  currentPosterUrl = data.poster_url || null;
  $('currentPoster').innerHTML = currentPosterUrl
    ? '<p>Locandina attuale:</p><img class="current-poster" src="' + esc(currentPosterUrl) + '" alt="Locandina attuale">'
    : '';
  $('formMessage').textContent = '';

  $('modal').classList.remove('hidden');
};

window.deleteEvent = async id => {
  if (!confirm('Eliminare questo evento?')) return;

  const { error } = await client
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    alert(error.message);
    return;
  }

  loadEvents();
};

$('newEvent').onclick = () => {
  editingId = null;

  $('modalTitle').textContent = 'Nuovo evento';
  $('eventForm').reset();
  $('published').checked = true;
  $('poster').value = '';
  currentPosterUrl = null;
  $('currentPoster').innerHTML = '';
  $('formMessage').textContent = '';

  $('modal').classList.remove('hidden');
};

$('closeModal').onclick =
$('cancel').onclick = () => {
  $('modal').classList.add('hidden');
};

$('eventForm').addEventListener('submit', async e => {
  e.preventDefault();

  const file = $('poster').files[0];

  $('formMessage').textContent = file ? 'Caricamento della locandina…' : 'Salvataggio…';

  let posterUrl = currentPosterUrl;

  if (file) {
    if (!file.type.startsWith('image/')) {
      $('formMessage').textContent = 'Errore: seleziona un file immagine.';
      return;
    }

    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileName = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + '.' + extension;
    const filePath = 'events/' + fileName;

    const upload = await client.storage.from('event-posters').upload(filePath, file, {
      cacheControl: '31536000',
      upsert: false
    });

    if (upload.error) {
      $('formMessage').textContent = 'Errore caricamento locandina: ' + upload.error.message;
      return;
    }

    posterUrl = client.storage.from('event-posters').getPublicUrl(filePath).data.publicUrl;
  }

  const payload = {
    title: $('title').value.trim(),
    event_date: $('date').value || null,
    place: $('place').value.trim() || null,
    description: $('description').value.trim() || null,
    published: $('published').checked,
    poster_url: posterUrl || null
  };

  let result;

  if (editingId) {
    result = await client.from('events').update(payload).eq('id', editingId);
  } else {
    result = await client.from('events').insert(payload);
  }

  if (result.error) {
    $('formMessage').textContent =
      'Errore: ' + result.error.message;
    return;
  }

  $('modal').classList.add('hidden');
  loadEvents();
});

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  $('loginMessage').textContent = 'Accesso in corso…';

  const { data, error } = await client.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value
  });

  if (error) {
    $('loginMessage').textContent =
      'Accesso non riuscito: ' + error.message;
    return;
  }

  showApp(data.user.email);
});

$('forgotPassword').onclick = async () => {
  const email = $('email').value.trim();

  if (!email) {
    $('loginMessage').textContent =
      'Inserisci prima la tua email.';
    return;
  }

  $('loginMessage').textContent =
    'Invio del link di recupero…';

  const redirectTo =
    window.location.origin +
    window.location.pathname.replace(/\/admin\.html$/, '/reset-password.html');

  const { error } = await client.auth.resetPasswordForEmail(
    email,
    { redirectTo }
  );

  if (error) {
    $('loginMessage').textContent =
      'Errore: ' + error.message;
    return;
  }

  $('loginMessage').textContent =
    'Controlla la tua email: abbiamo inviato il link per reimpostare la password.';
};

$('resetPasswordForm').addEventListener('submit', async e => {
  e.preventDefault();

  const password = $('newPassword').value;
  const confirmPassword = $('confirmPassword').value;

  if (password !== confirmPassword) {
    $('resetMessage').textContent =
      'Le due password non coincidono.';
    return;
  }

  $('resetMessage').textContent =
    'Salvataggio della nuova password…';

  const { error } = await client.auth.updateUser({
    password: password
  });

  if (error) {
    $('resetMessage').textContent =
      'Errore: ' + error.message;
    return;
  }

  $('resetMessage').textContent =
    'Password aggiornata. Ora puoi accedere.';

  setTimeout(() => {
    showLogin();
  }, 1500);
});

$('logout').onclick = async () => {
  await client.auth.signOut();
  showLogin();
};

client.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    $('login').classList.add('hidden');
    $('app').classList.add('hidden');
    $('resetPassword').classList.remove('hidden');
  }
});

(async () => {
  const { data } = await client.auth.getSession();

  if (data.session) {
    showApp(data.session.user.email);
  } else {
    $('login').classList.remove('hidden');
    $('resetPassword').classList.add('hidden');
    $('app').classList.add('hidden');
  }
})();
