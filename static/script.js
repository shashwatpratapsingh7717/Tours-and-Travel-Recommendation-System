const popularCities = [
  {
    name: "Shimla",
    image: "https://c.ndtvimg.com/2025-01/tuhgraag_shimla_625x300_31_January_25.jpg",
    rating: "5",
    duration: "3-7 days",
    description: "Shimla is the capital of Himachal Pradesh and a popular hill-station among Indian families and honeymooners."
  },
  {
    name: "Agra",
    image: "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/71/c3/53.jpg",
    rating: "3.7",
    duration: "6-8 days",
    description: "Located on the bank of river Yamuna in Uttar Pradesh, Agra is a popular tourist destination."
  },
  {
    name: "Delhi",
    image: "https://image.kkday.com/v2/image/get/w_960%2Cc_fit%2Cq_55%2Ct_webp/s1.kkday.com/product_147336/20230908031131_Jo6iV/jpg",
    rating: "2.7",
    duration: "3-5 days",
    description: "Capital of India, Delhi is a cosmopolitan city with historical Old Delhi and the modern New Delhi."
  },
  {
    name: "Goa",
    image: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/10/18/16/goa-overview.jpg",
    rating: "4.7",
    duration: "3-5 days",
    description: "Beach paradise with vibrant nightlife."
  },
  {
    name: "Manali",
    image: "https://cdn.getyourguide.com/img/tour/6481b3d6da770.jpeg/145.jpg",
    rating: "4.6",
    duration: "4-6 days",
    description: "Snowy retreats, mountains, and adventure sports."
  },
  {
    name: "Jaipur",
    image: "https://cdn.getyourguide.com/img/tour/0a3b64347720bead.jpeg/132.webp",
    rating: "4.5",
    duration: "2-4 days",
    description: "The Pink City full of royal palaces and rich culture."
  },
];

// Utility: Show/Hide Headings
function toggleHeadings({ showTop = false, showRecommended = false }) {
  const topHeading = document.getElementById("topCitiesHeading");
  const recommendedHeading = document.getElementById("recommendedCitiesHeading");

  if (topHeading && recommendedHeading) {
    topHeading.classList.toggle("hidden", !showTop);
    recommendedHeading.classList.toggle("hidden", !showRecommended);
  }
}

async function saveSearchToDB(city) {
  const username = localStorage.getItem("currentUser");
  if (!username) return;

  const res = await fetch("/save_search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, city })
  });

  await res.json(); // Optional: handle response if needed
}

async function searchCity() {
  const query = document.getElementById("searchInput").value.trim();
  const resultContainer = document.getElementById("resultContainer");

  resultContainer.innerHTML = "";

  if (!query) {
    resultContainer.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  toggleHeadings({ showRecommended: true });

  await saveSearchToDB(query);

  try {
    const response = await fetch(`/recommend?city=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.error) {
      resultContainer.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    const cities = data.results;

    cities.forEach(city => {
      const cleanDescription = cleanText(city.description);
      const shortDesc = getShortDescription(cleanDescription);

      const cityCard = document.createElement("div");
      cityCard.className = "city-card bg-white rounded-lg shadow p-4 mb-6";

      cityCard.innerHTML = `
        <h2 class="text-xl font-bold mb-2">${city.name}</h2>
        <img src="${city.image}" alt="${city.name}" class="w-full h-48 object-cover rounded mb-3">
        <p class="text-sm"><strong>Rating:</strong> ${city.rating}</p>
        <p class="text-sm"><strong>Ideal Duration:</strong> ${city.duration}</p>
        <p class="text-sm description" data-full="${cleanDescription}">
          ${shortDesc}
          ${cleanDescription.length > 120 ? `<span class="read-more text-blue-600 cursor-pointer">Read More</span>` : ''}
        </p>
        <div class="star-rating mt-2" data-city="${city.name}">
          ${[1, 2, 3, 4, 5].map(i => `
            <span class="star text-xl cursor-pointer text-gray-300 hover:text-yellow-500 transition" data-value="${i}">&#9733;</span>
          `).join('')}
        </div>
      `;

      resultContainer.appendChild(cityCard);
    });

    activateStarRatings();
    activateReadMore();
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    resultContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }
}

function activateStarRatings() {
  document.querySelectorAll(".star-rating").forEach(rating => {
    const stars = rating.querySelectorAll(".star");
    const city = rating.getAttribute("data-city");

    stars.forEach(star => {
      star.addEventListener("mouseover", () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => {
          s.classList.toggle("text-yellow-500", parseInt(s.dataset.value) <= val);
        });
      });

      star.addEventListener("mouseout", () => {
        stars.forEach(s => s.classList.remove("text-yellow-500"));
      });

      star.addEventListener("click", () => {
        const ratingVal = parseInt(star.dataset.value);

        fetch('/rate-city', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city, rating: ratingVal })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message || data.error);
        })
        .catch(() => alert("Failed to submit rating."));
      });
    });
  });
}

function showPopularCities() {
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";
  toggleHeadings({ showTop: true });

  popularCities.forEach(city => {
    const cleanDescription = cleanText(city.description);
    const shortDesc = getShortDescription(cleanDescription);

    const cityCard = document.createElement("div");
    cityCard.className = "city-card bg-white rounded-lg shadow p-4 mb-6";

    cityCard.innerHTML = `
      <h2 class="text-xl font-semibold mb-1">${city.name}</h2>
      <img src="${city.image}" alt="${city.name}" class="w-full h-48 object-cover rounded-xl mb-2">
      <p class="text-sm"><strong>Rating:</strong> ${city.rating}</p>
      <p class="text-sm mb-2"><strong>Ideal Duration:</strong> ${city.duration}</p>
      <p class="description text-gray-700 text-sm leading-relaxed" data-full="${cleanDescription}">
        ${shortDesc}
        ${cleanDescription.length > 120 ? `<span class="read-more text-blue-600 font-medium cursor-pointer">Read More</span>` : ''}
      </p>
      <hr class="my-4 border-gray-300">
    `;

    resultContainer.appendChild(cityCard);
  });

  activateReadMore();
}

function cleanText(text) {
  return text
    .replace(/[\[\]{}()"]/g, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,+/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

function getShortDescription(text) {
  return text.length > 120 ? text.substring(0, 120) + "..." : text;
}

function activateReadMore() {
  const elements = document.querySelectorAll('.read-more');
  elements.forEach(btn => {
    btn.addEventListener('click', () => {
      const para = btn.parentElement;
      const fullText = para.getAttribute('data-full');
      const isExpanded = btn.innerText === 'Read Less';

      para.innerHTML = isExpanded
        ? getShortDescription(fullText) + ` <span class='read-more text-blue-600 cursor-pointer'>Read More</span>`
        : fullText + ` <span class='read-more text-blue-600 cursor-pointer'>Read Less</span>`;

      activateReadMore();
    });
  });
}

function clearHistory() {
  document.getElementById("searchInput").value = "";
  document.getElementById("resultContainer").innerHTML = "";
  toggleHeadings({ showTop: true });
  showPopularCities();
}

async function loadUserLastSearch() {
  const username = localStorage.getItem("currentUser");
  if (!username) {
    toggleHeadings({ showTop: true });
    showPopularCities();
    return;
  }

  const response = await fetch(`/get_history?username=${username}`);
  const data = await response.json();

  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";

  if (data.status === "success" && data.history.length) {
    const lastCity = data.history[data.history.length - 1];

    const res = await fetch(`/recommend?city=${encodeURIComponent(lastCity)}`);
    const cityData = await res.json();

    if (!cityData.error) {
      cityData.results.forEach(city => {
        const cleanDescription = cleanText(city.description);
        const shortDesc = getShortDescription(cleanDescription);

        const cityCard = document.createElement("div");
        cityCard.className = "city-card bg-white rounded-lg shadow p-4 mb-6";

        cityCard.innerHTML = `
          <h2 class="text-xl font-bold mb-2">${city.name}</h2>
          <img src="${city.image}" alt="${city.name}" class="w-full h-48 object-cover rounded mb-3">
          <p class="text-sm"><strong>Rating:</strong> ${city.rating}</p>
          <p class="text-sm"><strong>Ideal Duration:</strong> ${city.duration}</p>
          <p class="text-sm description" data-full="${cleanDescription}">
            ${shortDesc}
            ${cleanDescription.length > 120 ? `<span class="read-more text-blue-600 cursor-pointer">Read More</span>` : ''}
          </p>
        `;

        resultContainer.appendChild(cityCard);
      });

      activateReadMore();
      toggleHeadings({ showRecommended: true });
    } else {
      toggleHeadings({ showTop: true });
      showPopularCities();
    }
  } else {
    toggleHeadings({ showTop: true });
    showPopularCities();
  }
}

window.onload = () => {
  loadUserLastSearch();
  document.getElementById("homeLink").addEventListener("click", (e) => {
    e.preventDefault();
    toggleHeadings({ showTop: true });
    showPopularCities();
  });
};
