const bundledCatalog = {"value":[{"title":"Interstellar","description":"A group of astronauts travels through a wormhole in search of a new home for humanity while Earth faces environmental collapse."},{"title":"The Dark Knight","description":"A masked vigilante faces a brilliant criminal mastermind who spreads chaos across Gotham City."},{"title":"Inception","description":"A skilled thief enters people\u0027s dreams to steal secrets and is given the dangerous task of planting an idea inside someone\u0027s mind."},{"title":"Titanic","description":"Two young people from different social classes fall in love aboard a luxury ship during its tragic maiden voyage."},{"title":"The Conjuring","description":"Paranormal investigators help a family that is being terrorized by a dark supernatural presence inside their farmhouse."},{"title":"Toy Story","description":"A group of toys secretly comes to life and struggles with friendship and jealousy when a new action figure joins them."},{"title":"Mad Max: Fury Road","description":"In a post-apocalyptic wasteland, a rebel warrior and a lone survivor escape a ruthless ruler in a high-speed desert chase."},{"title":"The Hangover","description":"A group of friends wakes up after a wild night in Las Vegas and must retrace their steps to find their missing friend."},{"title":"The Pursuit of Happyness","description":"A struggling salesman faces homelessness while raising his young son and working toward a better career and future."},{"title":"Jurassic Park","description":"Scientists create a theme park filled with cloned dinosaurs, but the creatures escape and threaten everyone on the island."},{"title":"The Matrix","description":"A computer hacker discovers that reality is an artificial simulation and joins a rebellion against the machines controlling humanity."},{"title":"Gladiator","description":"A betrayed Roman general becomes a gladiator and fights his way toward revenge against the emperor who destroyed his family."},{"title":"The Notebook","description":"A young couple from different backgrounds falls deeply in love while facing family pressure, separation, and the passage of time."},{"title":"A Quiet Place","description":"A family survives in silence in a world where deadly creatures hunt anything that makes a sound."},{"title":"Spider-Man: Into the Spider-Verse","description":"A teenager gains spider-like abilities and meets heroes from alternate dimensions while learning what it means to become a hero."},{"title":"Knives Out","description":"A detective investigates the mysterious death of a wealthy novelist while uncovering secrets and lies within his eccentric family."},{"title":"The Martian","description":"An astronaut stranded alone on Mars uses science and engineering to survive while NASA works to bring him home."},{"title":"John Wick","description":"A retired assassin returns to the criminal underworld after a personal tragedy and hunts down the people responsible."},{"title":"Coco","description":"A young boy who dreams of becoming a musician enters the land of the dead and uncovers hidden truths about his family."},{"title":"Shutter Island","description":"A federal marshal investigates the disappearance of a patient from an isolated psychiatric hospital and begins questioning his own reality."},{"title":"The Social Network","description":"A college student creates a social networking platform that grows rapidly while friendships and business relationships fall apart."},{"title":"Dangal","description":"A former wrestler trains his daughters to become competitive wrestlers and challenge traditional expectations in their community."},{"title":"3 Idiots","description":"Three engineering students navigate academic pressure, friendship, personal dreams, and the expectations placed on them by society."},{"title":"Drishyam","description":"A protective father uses intelligence and careful planning to protect his family after they become involved in a serious crime."},{"title":"Zindagi Na Milegi Dobara","description":"Three friends take a road trip across Spain where adventure, friendship, and new experiences force them to rethink their lives."},{"title":"Tumbbad","description":"A man obsessed with hidden treasure enters a dangerous world of ancient mythology, greed, and supernatural horror."},{"title":"Andhadhun","description":"A pianist pretending to be blind becomes trapped in a dangerous situation after witnessing events connected to a mysterious murder."},{"title":"Arrival","description":"A linguist is recruited to communicate with mysterious alien visitors and discovers that their language changes the way she understands time."},{"title":"The Revenant","description":"A frontiersman left for dead in the wilderness fights through brutal conditions to survive and seek revenge against those who betrayed him."},{"title":"Ford v Ferrari","description":"An automotive designer and a fearless race car driver work together to build a revolutionary car and compete against Ferrari in a famous endurance race."}],"Count":30};
const backendBase = location.protocol === "file:" || ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port !== "3000") ? "http://localhost:3000/" : new URL("./", location.href).href;
const $ = id => document.getElementById(id);
const artwork = {
  'Interstellar':'gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  'The Dark Knight':'qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'Inception':'oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  'Titanic':'9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
  'The Conjuring':'wVYREutTvI2tmxr6ujrHT704wGF.jpg',
  'Toy Story':'uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
  'Mad Max: Fury Road':'8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
  'The Matrix':'f89U3ADr1oiB1s9GkdPOEpXUk5H5.jpg',
  'Gladiator':'ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
  'The Martian':'5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg',
  'John Wick':'fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
  'Coco':'gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
  'Arrival':'x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
  'Jurassic Park':'oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
  'Shutter Island':'nrmXQ0zcZUL8jFLrakWc90IR8z9.jpg',
  'Knives Out':'pThyQovXQrw2m0s9x82twj48Jq4.jpg'
};
const groups = {
  'sci-fi':['Interstellar','Inception','The Matrix','The Martian','Arrival','Jurassic Park','Spider-Man: Into the Spider-Verse'],
  thriller:['The Dark Knight','The Conjuring','A Quiet Place','Knives Out','Shutter Island','Drishyam','Tumbbad','Andhadhun','John Wick'],
  drama:['Titanic','The Pursuit of Happyness','Gladiator','The Notebook','The Social Network','Dangal','The Revenant','Ford v Ferrari'],
  comedy:['Toy Story','The Hangover','Coco','3 Idiots','Zindagi Na Milegi Dobara']
};
let allMovies = [], view = 'home', filter = 'all', searchVersion = 0, detailVersion = 0;
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem('movieai-list') || '[]')); } catch { saved = new Set(); }
function saveTitle(title) {
  saved.has(title) ? saved.delete(title) : saved.add(title);
  try { localStorage.setItem('movieai-list', JSON.stringify([...saved])); } catch {}
  renderCatalog();
  $('heroSave').textContent = saved.has('Interstellar') ? '✓ In My List' : '＋ My List';
}
function genre(movie) { return Object.entries(groups).find(([, titles]) => titles.includes(movie.title))?.[0] || 'drama'; }
function poster(movie) {
  const wrap = document.createElement('div'); wrap.className = 'poster-wrap';
  const label = document.createElement('span'); label.className = 'poster-label'; label.textContent = movie.title; wrap.append(label);
  if (artwork[movie.title]) {
    const img = document.createElement('img'); img.className = 'poster'; img.alt = ''; img.loading = 'lazy';
    img.src = 'https://image.tmdb.org/t/p/w500/' + artwork[movie.title];
    img.addEventListener('error', () => img.remove(), {once:true}); wrap.append(img);
  }
  const shade = document.createElement('span'); shade.className = 'poster-shade'; wrap.append(shade);
  return wrap;
}
function renderMovies(movies, container) {
  container.replaceChildren();
  if (!Array.isArray(movies) || !movies.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = view === 'list' && container === $('movieCatalog') ? 'Your list is waiting. Open a movie and save it for later.' : 'No movies found. Try another mood.'; container.append(p); return; }
  movies.forEach(movie => {
    const card = document.createElement('button'); card.type = 'button'; card.className = 'movie-card'; card.setAttribute('aria-label', 'Explore ' + movie.title);
    const image = poster(movie);
    if (saved.has(movie.title)) { const marker = document.createElement('span'); marker.className = 'card-save'; marker.textContent = '✓'; image.append(marker); }
    const title = document.createElement('div'); title.className = 'movie-title'; title.textContent = movie.title;
    const meta = document.createElement('div'); meta.className = 'card-meta';
    if (Number.isFinite(movie.similarity)) { meta.classList.add('match'); meta.textContent = Math.round(Math.max(0,Math.min(1,movie.similarity))*100) + '% similarity'; }
    else { meta.textContent = genre(movie).replace('sci-fi','Sci-fi').replace(/^./, c => c.toUpperCase()) + ' · Movie'; }
    card.append(image,title,meta); card.addEventListener('click', () => openMovie(movie)); container.append(card);
  });
}
function renderCatalog() {
  let movies = view === 'list' ? allMovies.filter(m => saved.has(m.title)) : allMovies;
  if (filter !== 'all') movies = movies.filter(m => groups[filter]?.includes(m.title));
  $('catalogTitle').textContent = view === 'list' ? 'My List' : view === 'browse' ? 'Explore all movies' : "Tonight’s lineup";
  $('catalogSubtitle').textContent = view === 'list' ? 'Your favorites, ready for your next movie night.' : 'Great stories. One unforgettable night.';
  $('movieCount').textContent = movies.length + ' movies'; renderMovies(movies, $('movieCatalog'));
}
async function request(url) {
  const response = await fetch(url, {signal:AbortSignal.timeout(25000)});
  if (!response.ok) { let message = 'Movie discovery is unavailable. Please try again.'; try { message = (await response.json()).message || message; } catch {} throw new Error(message); }
  const data = await response.json();
  if (data && data.success === false) throw new Error(data.message || 'Movie discovery is unavailable.');
  return data;
}
async function searchMovies(query) {
  query = query.trim(); if (!query) { $('searchInput').focus(); return; }
  const version = ++searchVersion;
  $('searchInput').value = query; $('searchButton').disabled = true; $('searchStatus').textContent = 'Finding stories for your mood…';
  try {
    const data = await request(backendBase + 'api/movies/search?query=' + encodeURIComponent(query));
    if (version !== searchVersion) return;
    if (!Array.isArray(data.data)) throw new Error('No recommendations were returned. Please try again.');
    $('searchSection').hidden = false; $('resultsTitle').textContent = 'Picked for your mood';
    renderMovies(data.data, $('searchResults')); $('searchStatus').textContent = data.data.length ? 'Your AI recommendations are ready.' : 'No matches found. Try another mood.';
    $('searchSection').scrollIntoView({behavior:'smooth',block:'start'});
  } catch (error) { if (version === searchVersion) $('searchStatus').textContent = error.name === 'TimeoutError' ? 'That took too long. Please try again.' : error.message; }
  finally { if (version === searchVersion) $('searchButton').disabled = false; }
}
async function openMovie(movie) {
  const version = ++detailVersion, modal = $('movieModal');
  const section = document.createElement('div'); section.className = 'selected-movie';
  const info = document.createElement('div'); info.className = 'selected-info';
  const title = document.createElement('h2'); title.id = 'detailTitle'; title.textContent = movie.title;
  const description = document.createElement('p'); description.textContent = movie.description || 'Discover your next favorite story.';
  const save = document.createElement('button'); save.className = 'button red';
  const update = () => { save.textContent = saved.has(movie.title) ? '✓ Saved to My List' : '＋ Add to My List'; }; update();
  save.addEventListener('click', () => { saveTitle(movie.title); update(); }); info.append(title,description,save); section.append(poster(movie),info); $('selectedMovie').replaceChildren(section);
  $('similarMovies').replaceChildren(); $('similarStatus').textContent = 'Finding similar stories…';
  if (!modal.open) { modal.showModal(); document.body.style.overflow = 'hidden'; }
  try {
    const data = await request(backendBase + 'api/movies/' + encodeURIComponent(movie.title) + '/similar');
    if (version !== detailVersion || !modal.open) return;
    if (!Array.isArray(data.data)) throw new Error('Similar movies are unavailable. Please try again.');
    renderMovies(data.data, $('similarMovies')); $('similarStatus').textContent = '';
  } catch (error) { if (version === detailVersion && modal.open) $('similarStatus').textContent = error.message; }
}
$('searchForm').addEventListener('submit', event => { event.preventDefault(); searchMovies($('searchInput').value); });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => searchMovies(button.dataset.query)));
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  view = button.dataset.view; filter = 'all'; document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active',b === button)); document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('selected', b.dataset.filter === 'all')); renderCatalog(); $('catalogTitle').scrollIntoView({behavior:'smooth'});
}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('selected', b === button)); renderCatalog(); }));
$('clearSearch').addEventListener('click', () => { ++searchVersion; $('searchSection').hidden = true; $('searchInput').value = ''; $('searchStatus').textContent = ''; $('searchButton').disabled = false; $('searchResults').replaceChildren(); });
$('closeModal').addEventListener('click', () => $('movieModal').close());
$('movieModal').addEventListener('click', event => { if (event.target === $('movieModal')) { const bounds = $('movieModal').getBoundingClientRect(); if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) $('movieModal').close(); } });
$('movieModal').addEventListener('close', () => { ++detailVersion; document.body.style.overflow = ''; });
$('heroDetails').addEventListener('click', () => { const movie = allMovies.find(m => m.title === 'Interstellar'); if(movie) openMovie(movie); });
$('heroSave').addEventListener('click', () => saveTitle('Interstellar'));
$('heroSave').textContent = saved.has('Interstellar') ? '✓ In My List' : '＋ My List';
allMovies = bundledCatalog;
renderCatalog();
if (location.protocol !== 'file:') {
  request('./movie.json').then(movies => {
    if (Array.isArray(movies)) { allMovies = movies; renderCatalog(); }
  }).catch(() => { /* Keep the bundled catalog available when previewing. */ });
}

