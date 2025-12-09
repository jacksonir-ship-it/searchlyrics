// ===== SELECTORS =====
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';

// ===== SEARCH BY SONG OR ARTIST =====
async function searchSongs(term) {
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  // Replace console.log with our display function
  showDataSafe(data);
}

// ===== SHOW SONGS IN THE DOM (SAFE VERSION) =====
function showDataSafe(lyrics) {
  // Clear previous content
  result.innerHTML = '';
  more.innerHTML = '';

  // ⭐ CUSTOM FEATURE 2 — Show number of results
  const count = document.createElement('h2');
  count.textContent = `Found ${lyrics.data.length} results`;
  result.appendChild(count);

  // Build the <ul> containing songs
  const ul = document.createElement('ul');
  ul.className = 'songs';

  lyrics.data.forEach((song) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = song.artist.name;

    span.appendChild(strong);
    span.appendChild(document.createTextNode(` - ${song.title}`));
    li.appendChild(span);

    // "Get Lyrics" button
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Lyrics';
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  // ===== PAGINATION BUTTONS =====
  if (lyrics.prev || lyrics.next) {
    if (lyrics.prev) {
      const prevButton = document.createElement('button');
      prevButton.className = 'btn';
      prevButton.textContent = 'Prev';
      prevButton.addEventListener('click', () => getMoreSongs(lyrics.prev));
      more.appendChild(prevButton);
    }

    if (lyrics.next) {
      const nextButton = document.createElement('button');
      nextButton.className = 'btn';
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => getMoreSongs(lyrics.next));
      more.appendChild(nextButton);
    }
  }
}

// ===== GET MORE SONGS (PAGINATION) =====
async function getMoreSongs(url) {
  const res = await fetch(url);
  const data = await res.json();

  showDataSafe(data);
}

// ===== HANDLE "GET LYRICS" BUTTON CLICKS =====
result.addEventListener('click', (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');

    getLyricsSafe(artist, songTitle);
  }
});

// ===== GET LYRICS FOR A SONG =====
async function getLyricsSafe(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  // Clear the display area
  result.innerHTML = '';
  more.innerHTML = '';

  // If API returns an error
  if (data.error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = data.error;
    result.appendChild(errorMessage);
    return;
  }

  // Song title heading
  const heading = document.createElement('h2');
  const strong = document.createElement('strong');
  strong.textContent = artist;

  heading.append(strong, ` - ${songTitle}`);
  result.appendChild(heading);

  // Build lyrics with proper line breaks
  const span = document.createElement('span');
  const lines = data.lyrics.split(/\r\n|\r|\n/);

  lines.forEach((line, index) => {
    span.append(line);
    if (index < lines.length - 1) {
      span.append(document.createElement('br'));
    }
  });

  result.appendChild(span);
}

// ===== HANDLE SEARCH FORM SUBMISSION =====
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(searchTerm);
  }
});
