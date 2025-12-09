// ===== SELECTORS =====
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';

// ===== SEARCH BY SONG OR ARTIST =====
async function searchSongs(term) {
  // NOTE: the slash (/) after "suggest" is important
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  // Instead of console.log, we now show the data in the page:
  // showDataUnsafe(data); // if you want to use the innerHTML version
  showDataSafe(data); // safer DOM building version
}

// ===== SHOW SONGS IN THE DOM (SAFE VERSION) =====
function showDataSafe(lyrics) {
  // Clear previous content
  result.innerHTML = '';
  more.innerHTML = '';

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

    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Lyrics';
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  // Pagination buttons (Prev / Next)
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
  // The API gives you a next/prev URL. We just fetch that URL.
  const res = await fetch(url);
  const data = await res.json();

  showDataSafe(data);
}

// ===== CLICK HANDLER FOR "GET LYRICS" BUTTONS =====
result.addEventListener('click', (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');

    // getLyricsUnsafe(artist, songTitle);
    getLyricsSafe(artist, songTitle);
  }
});

// ===== GET LYRICS FOR SONG (SAFE VERSION) =====
async function getLyricsSafe(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  // Clear old content
  result.innerHTML = '';
  more.innerHTML = '';

  if (data.error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = data.error;
    result.append(errorMessage);
    return;
  }

  // Create heading
  const heading = document.createElement('h2');
  const strong = document.createElement('strong');
  strong.textContent = artist;

  heading.append(strong, ` - ${songTitle}`);
  result.append(heading);

  // Create lyrics block with line breaks
  const span = document.createElement('span');
  const lines = data.lyrics.split(/\r\n|\r|\n/);
  lines.forEach((line, index) => {
    span.append(line);
    if (index < lines.length - 1) {
      span.append(document.createElement('br'));
    }
  });

  result.append(span);
}

// ===== FORM SUBMIT EVENT =====
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(searchTerm);
  }
});
