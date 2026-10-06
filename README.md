<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Area amministratore — Lassù dove Volano gli Aquiloni</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>

<section id="login" class="login">
  <div class="login-box">
    <h1>Area amministratore</h1>
    <p>Gestisci gli eventi dell'associazione.</p>

    <form id="loginForm">
      <input id="email" type="email" autocomplete="email"
             placeholder="Email" required>

      <input id="password" type="password"
             autocomplete="current-password"
             placeholder="Password" required>

      <button type="submit">Accedi</button>
    </form>

    <p id="loginMessage" class="hint"></p>
    <a href="./">← Torna al sito</a>
  </div>
</section>

<section id="app" class="app hidden">
  <header class="top">
    <div>
      <strong>Area amministratore</strong>
      <span id="userEmail"></span>
    </div>
    <button id="logout">Esci</button>
  </header>

  <main>
    <div class="stats">
      <div>
        <b id="eventCount">0</b>
        <span>Eventi</span>
      </div>
    </div>

    <section class="panel">
      <div class="panel-title">
        <div>
          <h2>Eventi</h2>
          <p class="hint">
            Aggiungi, modifica o elimina gli appuntamenti del sito.
          </p>
        </div>

        <button id="newEvent" class="add">+ Nuovo evento</button>
      </div>

      <div id="eventsList"></div>
    </section>
  </main>
</section>

<div id="modal" class="modal hidden">
  <div class="modal-box">
    <button id="closeModal" class="close" type="button">×</button>

    <h2 id="modalTitle">Nuovo evento</h2>

    <form id="eventForm">
      <label>
        Titolo
        <input id="title" required>
      </label>

      <label>
        Data
        <input id="date" type="date">
      </label>

      <label>
        Luogo
        <input id="place">
      </label>

      <label>
        Descrizione
        <textarea id="description" rows="5"></textarea>
      </label>

      <label>
        <input id="published" type="checkbox" checked>
        Pubblicato sul sito
      </label>

      <div class="modal-actions">
        <button id="cancel" class="secondary" type="button">
          Annulla
        </button>
        <button type="submit">Salva</button>
      </div>
    </form>

    <p id="formMessage" class="hint"></p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="admin-config.js"></script>
<script src="admin.js"></script>

</body>
</html>
