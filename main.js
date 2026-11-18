// -----------------------------
// BookWorm Haven - main.js
// -----------------------------
// Handles Spotlight, Popular Books, Search, and Pagination
// Uses Google Books API
// -----------------------------

const apiKey = 'YOUR_GOOGLE_BOOKS_API_KEY';
let currentQuery = '';
let startIndex = 0;
const maxResults = 12;
let totalItems = 0;

// -----------------------------
// Data for Spotlight & Popular Sections
// -----------------------------

const spotlightBooks = [
  {
    cover: "superman.jpg",
    bg: "superman-bg.jpg",
    title: "Superman's Secret Identity: The Ultimate Sacrifice",
    author: "Pasquale De Marco",
    desc: "Superman's Secret Identity: The Ultimate Sacrifice is a 2025 non-fiction book by Pasquale De Marco that analyzes the complexities of Superman's dual identity and its profound impact on his life and commitment to justice.",
    googleId: "tQJ5EQAAQBAJ"
  },
  {
    cover: "mockingbird.jpg",
    bg: "mockingbird-bg.jpg",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    desc: "A powerful story of justice and childhood in the American South.",
    googleId: "zyTCAlFPjgYC"
  },
  {
    cover: "batman.jpg",
    bg: "batman-bg.jpg",
    title: "Batman: The Dark Knight Returns",
    author: "Frank Miller",
    desc: "A legendary comic about a retired Bruce Wayne battling for Gotham one last time.",
    googleId: "cSTjAAAAQBAJ"
  },
  {
    cover: "spiderman.jpg",
    bg: "spiderman-bg.jpg",
    title: "The Amazing Spider-Man: The Night Gwen Stacy Died",
    author: "Stan Lee",
    desc: "Peter Parker becomes the web-slinging superhero Spider-Man, facing responsibilities and teenage struggles.",
    googleId: "iERrDwAAQBAJ"
  },
  {
    cover: "star.jpg",
    bg: "star-bg.jpg",
    title: "Star Wars: Darth Vader (2020)",
    author: "Greg Pak",
    desc: "After being rejected by Luke Skywalker, Darth Vader begins a mission of revenge and discovery.",
    googleId: "gTckEQAAQBAJ"
  }
];

const popularBooks = [
  { cover: "harrypotter.jpg", name: "Harry Potter and the Philosopher's Stone", googleId: "Qu-JQgAACAAJ" },
  { cover: "hobbit.jpg", name: "The Hobbit", googleId: "U799AY3yfqcC" },
  { cover: "lotr.jpg", name: "Lord of the Rings", googleId: "LRD9EAAAQBAJ" },
  { cover: "batman.jpg", name: "Batman: The Dark Knight Returns", googleId: "cSTjAAAAQBAJ" },
  { cover: "superman.jpg", name: "Superman's Secret Identity", googleId: "tQJ5EQAAQBAJ" },
  { cover: "gatsby.jpg", name: "The Great Gatsby", googleId: "DDoEEAAAQBAJ" },
  { cover: "mockingbird.jpg", name: "To Kill a Mockingbird", googleId: "0NEbHGREK7cC" },
  { cover: "pride.jpg", name: "Pride and Prejudice", googleId: "BD2yDwAAQBAJ" }
];

// -----------------------------
// Helper Functions
// -----------------------------

function createSpotlightSlide(book, idx, activeIdx) {
  return `
    <div class="spotlight-slide${idx === activeIdx ? ' active' : ''}">
      <a href="details.html?id=${book.googleId}" class="spotlight-cover-link">
        <img class="spotlight-cover" src="${book.cover}" alt="${book.title}">
      </a>
      <div class="spotlight-info">
        <h3>${book.title}</h3>
        <h4>${book.author}</h4>
        <p>${book.desc}</p>
      </div>
    </div>
  `;
}

function createSpotlightDots(len, activeIdx) {
  return Array.from({ length: len }).map((_, i) =>
    `<div class="spotlight-dot${i === activeIdx ? ' active' : ''}" data-idx="${i}"></div>`
  ).join('');
}

function createPopularCard(book) {
  return `
    <a href="details.html?id=${book.googleId}" class="popular-book-link" style="text-decoration:none;">
      <div class="popular-card">
        <img src="${book.cover}" alt="${book.name}" />
        <p>${book.name}</p>
      </div>
    </a>
  `;
}

function setSpotlightBackground(idx) {
  const bgEl = document.getElementById('spotlight-bg');
  bgEl.style.opacity = 0.82;
  requestAnimationFrame(() => {
    bgEl.style.backgroundImage = `url('${spotlightBooks[idx].bg}')`;
    bgEl.style.opacity = 0.95;
  });
}

// -----------------------------
// Spotlight Rendering
// -----------------------------

let spotlightIdx = 0;

function renderSpotlight(idx) {
  const carousel = document.getElementById('spotlight-carousel');
  const indicators = document.getElementById('spotlight-indicators');
  carousel.innerHTML = spotlightBooks.map((b, i) => createSpotlightSlide(b, i, idx)).join('');
  indicators.innerHTML = createSpotlightDots(spotlightBooks.length, idx);

  Array.from(indicators.children).forEach(dot => {
    dot.onclick = () => {
      spotlightIdx = parseInt(dot.dataset.idx, 10);
      renderSpotlight(spotlightIdx);
    };
  });

  setSpotlightBackground(idx);
}

function startSpotlightLoop() {
  setInterval(() => {
    spotlightIdx = (spotlightIdx + 1) % spotlightBooks.length;
    renderSpotlight(spotlightIdx);
  }, 5000);
}

// -----------------------------
// Popular Books Section
// -----------------------------

function renderPopular() {
  document.getElementById('popular-grid').innerHTML =
    popularBooks.map(createPopularCard).join('');
}

// -----------------------------
// Search Books (Title / Author / ISBN)
// -----------------------------

async function searchBooks(query, append = false) {
  const resultsContainer = document.getElementById('results');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

if (!append) {
  startIndex = 0;
  totalItems = 0;
  resultsContainer.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Loading books...</p>
    </div>
  `;
}


  try {
    // Smart query detection
    let queryType;
    if (/^\d{10}(\d{3})?$/.test(query)) {
      queryType = `isbn:${query}`; // ISBN
    } else {
      queryType = `intitle:${query} OR inauthor:${query}`; // Title or Author
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryType)}&key=${apiKey}&maxResults=${maxResults}&startIndex=${startIndex}`;

    const res = await fetch(url);
    const data = await res.json();

    let html = '';
    if (data.items && data.items.length) {
      html = data.items.map(item => {
        const info = item.volumeInfo;
        const cover = info.imageLinks ? info.imageLinks.thumbnail : 'no-cover.png';
        const title = info.title || 'No title available';
        const authors = info.authors ? info.authors.join(', ') : 'Unknown author';
        const description = info.description || 'No description available';

        return `
          <a href="details.html?id=${item.id}" style="text-decoration:none;">
            <div class="result-card">
              <img src="${cover}" alt="${title}" />
              <h3>${title}</h3>
              <p class="author">${authors}</p>
              <p class="description">${description}</p>
            </div>
          </a>
        `;
      }).join('');
    } else if (!append) {
      html = '<p>No results found.</p>';
    }

    if (append) {
      resultsContainer.innerHTML += html;
    } else {
      resultsContainer.innerHTML = html;
    }

    totalItems = data.totalItems || 0;
    if (totalItems > startIndex + maxResults) {
      loadMoreBtn.style.display = '';
    } else {
      loadMoreBtn.style.display = 'none';
    }

  } catch (err) {
    resultsContainer.innerHTML = '<p>Error loading results. Please try again later.</p>';
    loadMoreBtn.style.display = 'none';
    console.error(err);
  }
}

// -----------------------------
// Page Initialization
// -----------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Home Page
  if (document.getElementById('spotlight-carousel')) {
    renderSpotlight(0);
    startSpotlightLoop();
  }

  if (document.getElementById('popular-grid')) {
    renderPopular();
  }

  // Results Page
  if (document.getElementById('results')) {
    currentQuery = new URLSearchParams(window.location.search).get('q') || '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = currentQuery;

    if (currentQuery) {
      searchBooks(currentQuery, false);
    } else {
      document.getElementById('results').innerHTML = '<p>No search query provided.</p>';
      document.getElementById('loadMoreBtn').style.display = 'none';
    }

    // Proper form handler (replaces the empty one)
    const form = document.getElementById('searchForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = (document.getElementById('searchInput') || {}).value || '';
        if (!q) return;
        currentQuery = q;
        startIndex = 0;
        searchBooks(currentQuery, false);
        const newUrl = `${location.pathname}?q=${encodeURIComponent(q)}`;
        history.replaceState({}, '', newUrl);
      });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        startIndex += maxResults;
        searchBooks(currentQuery, true);
      });
    }
  }
});
