// -----------------------------
// BookWorm Haven - details.js
// -----------------------------
// Fetches and displays full book information from Google Books API
// -----------------------------

const apiKey = 'YOUR_GOOGLE_BOOKS_API_KEY';

// Helper to safely get values or defaults
function safe(val, fallback = '') {
  return val != null ? val : fallback;
}

async function fetchBookDetails(volumeId) {
  const url = `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not fetch details.');
  return await res.json();
}

// Renders all book info (title, author, desc, cover, date, preview)
function renderDetails(volumeInfo) {
  const detailsDiv = document.getElementById('details');

  const cover = safe(volumeInfo.imageLinks?.thumbnail, 'no-cover.png');
  const title = safe(volumeInfo.title, 'No title available');
  const author = safe(volumeInfo.authors?.join(', '), 'Unknown author');
  const desc = safe(volumeInfo.description, 'No description available.');
  const publishedDate = safe(volumeInfo.publishedDate, 'N/A');
  const previewLink = safe(volumeInfo.previewLink, '');

  // HTML structure for the details view
  detailsDiv.innerHTML = `
    <div class="details-header">
      <img class="details-image" src="${cover}" alt="${title}" />
      <div class="details-info">
        <div class="details-title">${title}</div>
        <div class="details-author">${author}</div>

        <p><span class="details-label">Published Date:</span> ${publishedDate}</p>

        <div class="details-label">Description:</div>
        <div class="details-desc">${desc}</div>

        ${
          previewLink
            ? `<a href="${previewLink}" target="_blank" class="preview-btn">🔗 Preview on Google Books</a>`
            : ''
        }
      </div>
    </div>
  `;
}

// Show book details when the page loads
async function showBookDetails() {
  const params = new URLSearchParams(window.location.search);
  const volumeId = params.get('id');
  const detailsDiv = document.getElementById('details');

  if (!volumeId) {
    detailsDiv.innerHTML = '<p>Invalid book ID.</p>';
    return;
  }

  try {
    const data = await fetchBookDetails(volumeId);
    if (data && data.volumeInfo) {
      renderDetails(data.volumeInfo);
    } else {
      detailsDiv.innerHTML = '<p>No details found for this book.</p>';
    }
  } catch (err) {
    console.error(err);
    detailsDiv.innerHTML = '<p>Error loading book details. Please try again later.</p>';
  }
}

document.addEventListener('DOMContentLoaded', showBookDetails);
