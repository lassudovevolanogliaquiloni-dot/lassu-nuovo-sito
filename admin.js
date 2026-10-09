const client = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_PUBLISHABLE_KEY
);

const $ = id => document.getElementById(id);
let editingId = null;

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
  $('formMessage').textContent = '';

  $('modal').classList.remove('hidden');
};

$('closeModal').onclick =
$('cancel').onclick = () => {
  $('modal').classList.add('hidden');
};

$('eventForm').addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    title: $('title').value.trim(),
    event_date: $('date').value || null,
    place: $('place').value.trim() || null,
    description: $('description').value.trim() || null,
    published: $('published').checked
  };

  let result;

  if (editingId) {
    result = await client
      .from('events')
      .update(payload)
      .eq('id', editingId);
  } else {
    result = await client
      .from('events')
      .insert(payload);
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
