const popularCities = [
  {
    name: "Shimla",
    image: "https://c.ndtvimg.com/2025-01/tuhgraag_shimla_625x300_31_January_25.jpg",
    rating: "5.0",
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

// --- UTILITY FUNCTIONS ---

function toggleHeadings({ showTop = false, showRecommended = false }) {
  const topHeading = document.getElementById("topCitiesHeading");
  const recommendedHeading = document.getElementById("recommendedCitiesHeading");

  if (topHeading && recommendedHeading) {
    topHeading.classList.toggle("hidden", !showTop);
    recommendedHeading.classList.toggle("hidden", !showRecommended);
  }
}

function cleanText(text) {
  return text
    .replace(/[\[\]{}()"]/g, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/,+/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

// Increased length boundary to match detailed descriptions
function getShortDescription(text) {
  return text.length > 400 ? text.substring(0, 400) + "..." : text;
}

function clearHistory() {
  document.getElementById("searchInput").value = "";
  document.getElementById("resultContainer").innerHTML = "";
  toggleHeadings({ showTop: true });
  showPopularCities();
}

// --- MASTER CARD GENERATOR (DRY PRINCIPLE) ---
function createCityCardElement(city) {
  const cleanDescription = cleanText(city.description);
  const shortDesc = getShortDescription(cleanDescription);
  const cityCard = document.createElement("div");

  // Premium, highly readable text layouts via responsive Tailwind tokens
  cityCard.className = "city-card bg-white rounded-2xl shadow-md p-5 mb-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 flex flex-col";

  cityCard.innerHTML = `
    <div class="relative overflow-hidden rounded-xl mb-4 group">
      <img src="${city.image}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';" alt="${city.name}" class="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500">
      <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-gray-800 shadow-lg">
        ⭐ ${city.rating || "N/A"}
      </div>
    </div>
    
    <h2 class="text-2xl font-extrabold text-gray-800 mb-1">${city.name}</h2>
    <p class="text-sm text-blue-600 font-medium mb-3">
      ✈️ Ideal Duration: ${city.duration || "Varies"}
    </p>
    
    <p class="text-base md:text-lg description text-gray-600 flex-grow leading-relaxed tracking-wide" data-full="${cleanDescription}">
      ${shortDesc}
      ${cleanDescription.length > 400 ? `<span class="read-more text-blue-600 font-bold cursor-pointer ml-1 hover:underline">Read More</span>` : ''}
    </p>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Rate your experience</p>
      <div class="star-rating flex gap-1" data-city="${city.name}">
        ${[1, 2, 3, 4, 5].map(i => `
          <span class="star text-2xl cursor-pointer text-gray-300 hover:text-yellow-400 transition-colors" data-value="${i}">&#9733;</span>
        `).join('')}
      </div>
    </div>
  `;

  return cityCard;
}

// --- INTERACTIVE FEATURES ---

function activateReadMore() {
  const elements = document.querySelectorAll('.read-more');
  elements.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
      const para = newBtn.parentElement;
      const fullText = para.getAttribute('data-full');
      const isExpanded = newBtn.innerText === 'Read Less';

      // Re-renders view and properly scales to match full paragraphs cleanly
      para.innerHTML = isExpanded
        ? getShortDescription(fullText) + ` <span class='read-more text-blue-600 font-bold cursor-pointer hover:underline'>Read More</span>`
        : fullText + ` <span class='read-more text-blue-600 font-bold cursor-pointer hover:underline'>Read Less</span>`;

      activateReadMore();
    });
  });
}

function activateStarRatings() {
  document.querySelectorAll(".star-rating").forEach(rating => {
    const stars = rating.querySelectorAll(".star");
    const city = rating.getAttribute("data-city");

    stars.forEach(star => {
      star.addEventListener("mouseover", () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => {
          s.classList.toggle("text-yellow-400", parseInt(s.dataset.value) <= val);
        });
      });

      star.addEventListener("mouseout", () => {
        stars.forEach(s => s.classList.remove("text-yellow-400"));
      });

      star.addEventListener("click", () => {
        const ratingVal = parseInt(star.dataset.value);
        stars.forEach(s => {
          s.classList.toggle("text-yellow-500", parseInt(s.dataset.value) <= ratingVal);
          s.style.pointerEvents = 'none';
        });

        fetch('/rate-city', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city, rating: ratingVal })
        })
        .then(res => res.json())
        .then(data => alert(data.message || data.error))
        .catch(() => alert("Failed to submit rating."));
      });
    });
  });
}

// --- CORE LOGIC ---

async function saveSearchToDB(city) {
  const username = localStorage.getItem("currentUser");
  if (!username) return;

  await fetch("/save_search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, city })
  });
}

function showPopularCities() {
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";
  toggleHeadings({ showTop: true });

  popularCities.forEach(city => {
    const cityCard = createCityCardElement(city);
    resultContainer.appendChild(cityCard);
  });

  activateReadMore();
  activateStarRatings();
}

async function searchCity() {
  const query = document.getElementById("searchInput").value.trim();
  const resultContainer = document.getElementById("resultContainer");
  const loadingSpinner = document.getElementById("loadingSpinner");

  resultContainer.innerHTML = "";

  if (!query) {
    resultContainer.innerHTML = "<p class='text-red-500 font-semibold mt-4 text-center w-full col-span-3'>Please enter a city or keyword.</p>";
    return;
  }

  loadingSpinner.classList.remove("hidden");
  loadingSpinner.classList.add("flex");

  toggleHeadings({ showRecommended: true });
  await saveSearchToDB(query);

  try {
    const res = await fetch(`/recommend?city=${encodeURIComponent(query)}`);
    const cityData = await res.json();

    loadingSpinner.classList.add("hidden");
    loadingSpinner.classList.remove("flex");

    if (cityData.error) {
      resultContainer.innerHTML = `<p class="text-red-500 font-semibold mt-4 text-center w-full col-span-3">${cityData.error}</p>`;
      setTimeout(showPopularCities, 1500);
      return;
    }

    cityData.results.forEach(city => {
      const cityCard = createCityCardElement(city);
      resultContainer.appendChild(cityCard);
    });

    activateReadMore();
    activateStarRatings();

  } catch (error) {
    loadingSpinner.classList.add("hidden");
    loadingSpinner.classList.remove("flex");
    resultContainer.innerHTML = "<p class='text-red-500 font-semibold mt-4 text-center w-full col-span-3'>Network error. Please try again.</p>";
  }
}

async function loadUserLastSearch() {
  const username = localStorage.getItem("currentUser");
  if (!username) {
    showPopularCities();
    return;
  }

  try {
    const response = await fetch(`/get_history?username=${username}`);
    const data = await response.json();

    if (data.status === "success" && data.history && data.history.length > 0) {
      const lastCity = data.history[data.history.length - 1];
      
      const res = await fetch(`/recommend?city=${encodeURIComponent(lastCity)}`);
      const cityData = await res.json();

      if (!cityData.error) {
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = "";
        
        cityData.results.forEach(city => {
          const cityCard = createCityCardElement(city);
          resultContainer.appendChild(cityCard);
        });

        toggleHeadings({ showRecommended: true });
        activateReadMore();
        activateStarRatings();
      } else {
        showPopularCities();
      }
    } else {
      showPopularCities();
    }
  } catch(err) {
    showPopularCities();
  }
}

// --- INITIALIZATION ---
window.onload = () => {
  loadUserLastSearch();
  
  const homeLink = document.getElementById("homeLink");
  if(homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("searchInput").value = "";
      showPopularCities();
    });
  }
};