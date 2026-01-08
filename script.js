// 🔥 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDSkLxJhrIb3U1wtGYGwD4EehRg3zRy5Tk",
    authDomain: "netflix-clone-2ea1e.firebaseapp.com",
    projectId: "netflix-clone-2ea1e",
    storageBucket: "netflix-clone-2ea1e.firebasestorage.app",
    messagingSenderId: "165935146302",
    appId: "1:165935146302:web:4040fd6a25a82c151c786f",
    measurementId: "G-H66VSWHHV5"
};

const API_KEY = "3dd58095a39e7afdcf4be3e95959199a"; 
const base_url = "https://image.tmdb.org/t/p/original/";
let currentUser = null;
let currentUserData = null;

// Wait for Firebase to load, then initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
    } else {
        // Wait for Firebase to load
        setTimeout(initializeFirebase, 500);
    }
});

function initializeFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        console.log("✅ Firebase initialized successfully");
        
        // Setup auth listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("✅ User is logged in:", user.email);
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('splash-screen').classList.add('hidden');
                document.getElementById('profile-screen').classList.remove('hidden');
                
                // Load user data
                loadUserFromFirestore(user.uid);
                
                loadApp();
                showSplashScreen();
            } else {
                console.log("❌ User is logged out");
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('splash-screen').classList.add('hidden');
                document.getElementById('profile-screen').classList.add('hidden');
                document.getElementById('home-screen').classList.add('hidden');
            }
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
    }
}

// Make auth and db globally accessible
let auth = null;
let db = null;

// Update these after Firebase loads
setTimeout(() => {
    auth = firebase.auth();
    db = firebase.firestore();
}, 1000);

// 🟢 Google Sign-In Function
async function signInWithGoogle() {
    try {
        if (!firebase) {
            alert("Firebase is still loading. Please wait and try again.");
            return;
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        console.log("✅ User signed in:", user.email);
        
        // Save user to Firestore
        await saveUserToFirestore(user);
        
        // Hide login, show splash
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('splash-screen').classList.remove('hidden');
        
        // Load the app
        loadApp();
        showSplashScreen();
        
    } catch (error) {
        console.error("❌ Google Sign-In Error:", error);
        alert("Sign-in failed: " + error.message);
    }
}
function showSplashScreen() {
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
    }, 3500); // 3.5 seconds
}

// Banner Slider Variables
let bannerMovies = [];
let currentBannerIndex = 0;
let bannerInterval = null;

// App Start Logic
async function loadApp() {
    // 1. Profiles Load karo
    const response = await fetch('data.json');
    const localData = await response.json();
    const profileList = document.getElementById('profile-list');
    profileList.innerHTML = '';

    localData.users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'profile-card';
        div.innerHTML = `<img src="${user.avatar}"><span>${user.name}</span>`;
        div.onclick = () => selectProfile(user);
        profileList.appendChild(div);
    });

    // 2. Start Banner Slider (NEW CODE)
    startBannerSlider();

    // 3. Baki Movies ki rows load karo
    fetchMovies(`https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`, 'row-trending');
    fetchMovies(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28`, 'row-action');
}

// 🟢 NEW: Banner Slider Function - Fetches top 5 trending movies and auto-switches every 4 seconds
async function startBannerSlider() {
    try {
        // Fetch trending movies from TMDB API
        const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=en-US`;
        const response = await fetch(url);
        const data = await response.json();

        // Take top 5 movies
        bannerMovies = data.results.slice(0, 5);

        if (bannerMovies.length === 0) {
            console.error("No trending movies found");
            return;
        }

        // Display the first movie
        updateBannerDisplay();

        // Auto-switch every 4 seconds
        bannerInterval = setInterval(() => {
            currentBannerIndex = (currentBannerIndex + 1) % bannerMovies.length;
            updateBannerDisplay();
        }, 4000);

    } catch (error) {
        console.error("Banner Slider Error:", error);
    }
}

// Helper function to update banner display with current movie
function updateBannerDisplay() {
    const movie = bannerMovies[currentBannerIndex];

    // Update background image, title, and description
    document.querySelector(".banner").style.backgroundImage = `url("${base_url}${movie.backdrop_path}")`;
    document.querySelector(".banner_title").innerText = movie.title || movie.name;
    document.querySelector(".banner_description").innerText = movie.overview;

    // Update Play button's onclick to call playTrailer for current movie
    const playBtn = document.querySelector('.banner_buttons .banner_button');
    if (playBtn) {
        playBtn.onclick = () => playTrailer(movie.id);
    }
}

// Movies Rows Display karna
async function fetchMovies(url, elementId) {
    const response = await fetch(url);
    const data = await response.json();
    const row = document.getElementById(elementId);

    data.results.forEach(movie => {
        if(movie.backdrop_path) {
            const img = document.createElement('img');
            img.className = 'row_poster';
            img.src = `${base_url}${movie.backdrop_path}`;
            img.onclick = () => playTrailer(movie.id); 
            row.appendChild(img);
        }
    });
}

// Trailer Play Logic
async function playTrailer(movieId) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
        const response = await fetch(url);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");

        if (trailer) {
            const overlay = document.getElementById('video-overlay');
            const player = document.getElementById('youtube-player');
            player.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            overlay.classList.remove('hidden'); 
            overlay.style.display = 'flex';
        } else {
            // Agar Movie me nahi mila, to TV show me try karo (Stranger Things ke liye)
            playTvTrailer(movieId);
        }
    } catch (error) {
        console.error("Error playing video:", error);
    }
}

// Extra: TV Shows ke trailer ke liye fallback
async function playTvTrailer(tvId) {
     const url = `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${API_KEY}&language=en-US`;
     const response = await fetch(url);
     const data = await response.json();
     const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
     if (trailer) {
        const overlay = document.getElementById('video-overlay');
        const player = document.getElementById('youtube-player');
        player.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
        overlay.classList.remove('hidden'); 
        overlay.style.display = 'flex';
     } else {
        alert("Trailer not found");
     }
}

function closeVideo() {
    const overlay = document.getElementById('video-overlay');
    const player = document.getElementById('youtube-player');
    player.src = "";
    overlay.style.display = 'none';
}

function selectProfile(user) {
    currentUser = user; // Store the current user
    document.getElementById('profile-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('current-user-avatar').src = user.avatar;
    
    // Populate the dropdown with user info
    document.getElementById('dropdown-avatar').src = user.avatar;
    document.getElementById('dropdown-username').innerText = user.name;
    
    // Load user data from Firestore
    loadUserFromFirestore(auth.currentUser.uid);
}

// 🟢 Toggle Profile Dropdown Menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('hidden');
}

// 🟢 Sign Out Function - Return to Login Screen
function signOut() {
    currentUser = null;
    document.getElementById('profile-dropdown').classList.add('hidden');
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('profile-screen').classList.add('hidden');
    
    // Sign out from Firebase
    firebase.auth().signOut().then(() => {
        console.log("✅ User signed out from Firebase");
        document.getElementById('login-screen').style.display = 'flex';
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
}

// ========== FIRESTORE FUNCTIONS (Firebase 8.x syntax) ==========

// 🟢 Save User Data to Firestore
async function saveUserToFirestore(user) {
    try {
        await firebase.firestore().collection("users").doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            photoURL: user.photoURL || "",
            myList: [],
            watchHistory: [],
            createdAt: new Date(),
            lastLogin: new Date()
        }, { merge: true });
        console.log("✅ User saved to Firestore");
    } catch (error) {
        console.error("Error saving user:", error);
    }
}

// 🟢 Load User Data from Firestore
async function loadUserFromFirestore(userId) {
    try {
        const userDoc = await firebase.firestore().collection("users").doc(userId).get();
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            console.log("✅ User data loaded:", currentUserData);
            loadMyList();
        } else {
            console.log("User document doesn't exist, creating...");
            await saveUserToFirestore(firebase.auth().currentUser);
        }
    } catch (error) {
        console.error("Error loading user:", error);
    }
}

// ========== MY LIST FUNCTIONS ==========

// 🟢 Add Movie to My List
async function addToMyList(movieId) {
    if (!firebase.auth().currentUser) return;
    try {
        await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            myList: firebase.firestore.FieldValue.arrayUnion(movieId)
        });
        console.log("✅ Movie added to My List");
        loadMyList();
    } catch (error) {
        console.error("Error adding to My List:", error);
    }
}

// 🟢 Remove Movie from My List
async function removeFromMyList(movieId) {
    if (!firebase.auth().currentUser) return;
    try {
        await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            myList: firebase.firestore.FieldValue.arrayRemove(movieId)
        });
        console.log("✅ Movie removed from My List");
        loadMyList();
    } catch (error) {
        console.error("Error removing from My List:", error);
    }
}

// 🟢 Load and Display My List
async function loadMyList() {
    if (!firebase.auth().currentUser) return;
    try {
        const userDoc = await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get();
        const myListIds = userDoc.data().myList || [];
        const myListDiv = document.getElementById('row-mylist');
        myListDiv.innerHTML = '';
        
        for (let movieId of myListIds) {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
            const movie = await response.json();
            
            if (movie.poster_path) {
                const img = document.createElement('img');
                img.className = 'row_poster';
                img.src = `${base_url}${movie.poster_path}`;
                img.onclick = () => playTrailer(movie.id);
                myListDiv.appendChild(img);
            }
        }
    } catch (error) {
        console.error("Error loading My List:", error);
    }
}

// ========== WATCH HISTORY FUNCTIONS ==========

// 🟢 Save Movie to Watch History
async function saveWatchHistory(movieId, movieTitle) {
    if (!firebase.auth().currentUser) return;
    try {
        const watchEntry = {
            movieId: movieId,
            movieTitle: movieTitle,
            watchedAt: new Date().toISOString()
        };
        
        await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            watchHistory: firebase.firestore.FieldValue.arrayUnion(watchEntry)
        });
        console.log("✅ Watch history saved");
    } catch (error) {
        console.error("Error saving watch history:", error);
    }
}

// 🟢 Load and Display Watch History
async function loadWatchHistory() {
    if (!firebase.auth().currentUser) return;
    try {
        const userDoc = await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get();
        const watchHistory = userDoc.data().watchHistory || [];
        const historyList = document.getElementById('watch-history-list');
        historyList.innerHTML = '';
        
        if (watchHistory.length === 0) {
            historyList.innerHTML = '<p style="color: #808080;">No movies watched yet</p>';
            return;
        }
        
        watchHistory.reverse().forEach(entry => {
            const date = new Date(entry.watchedAt).toLocaleDateString();
            const item = document.createElement('div');
            item.className = 'watch-history-item';
            item.innerHTML = `
                <div class="watch-history-item-title">${entry.movieTitle}</div>
                <div class="watch-history-item-date">Watched on ${date}</div>
            `;
            historyList.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading watch history:", error);
    }
}

// ========== SEARCH & FILTER FUNCTIONS ==========

// 🟢 Search Movies
async function searchMovies(query) {
    if (query.length < 2) return;
    try {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`;
        const response = await fetch(url);
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error("Search error:", error);
    }
}

// 🟢 Filter by Genre
async function filterByGenre(genreId) {
    if (!genreId) {
        loadApp();
        return;
    }
    try {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
        const response = await fetch(url);
        const data = await response.json();
        displayFilterResults(data.results);
    } catch (error) {
        console.error("Filter error:", error);
    }
}

// 🟢 Display Search Results
function displaySearchResults(movies) {
    const trendingRow = document.getElementById('row-trending');
    const actionRow = document.getElementById('row-action');
    trendingRow.innerHTML = '';
    actionRow.innerHTML = '';
    
    movies.forEach(movie => {
        if (movie.poster_path) {
            const img = document.createElement('img');
            img.className = 'row_poster';
            img.src = `${base_url}${movie.poster_path}`;
            img.onclick = () => playTrailer(movie.id);
            trendingRow.appendChild(img);
        }
    });
}

// 🟢 Display Filter Results
function displayFilterResults(movies) {
    const actionRow = document.getElementById('row-action');
    actionRow.innerHTML = '';
    
    movies.forEach(movie => {
        if (movie.poster_path) {
            const img = document.createElement('img');
            img.className = 'row_poster';
            img.src = `${base_url}${movie.poster_path}`;
            img.onclick = () => playTrailer(movie.id);
            actionRow.appendChild(img);
        }
    });
}

// ========== PROFILE UPDATE FUNCTIONS ==========

// 🟢 Open Profile Edit Modal
function openProfileModal() {
    document.getElementById('profile-modal').classList.remove('hidden');
    if (currentUserData) {
        document.getElementById('edit-name').value = currentUserData.displayName || '';
        document.getElementById('edit-avatar').value = currentUserData.photoURL || '';
    }
}

// 🟢 Close Profile Edit Modal
function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

// 🟢 Save Profile Changes
async function saveProfileChanges() {
    if (!firebase.auth().currentUser) return;
    
    const newName = document.getElementById('edit-name').value;
    const newAvatar = document.getElementById('edit-avatar').value;
    
    try {
        // Update Firestore
        await firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
            displayName: newName,
            photoURL: newAvatar
        });
        
        // Update UI
        currentUserData.displayName = newName;
        currentUserData.photoURL = newAvatar;
        document.getElementById('current-user-avatar').src = newAvatar;
        document.getElementById('dropdown-username').innerText = newName;
        document.getElementById('dropdown-avatar').src = newAvatar;
        
        alert("Profile updated successfully!");
        closeProfileModal();
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile. Please try again.");
    }
}

// ========== MODAL FUNCTIONS ==========

// 🟢 Open Watch History Modal
function openWatchHistory() {
    document.getElementById('watch-history-modal').classList.remove('hidden');
    loadWatchHistory();
    document.getElementById('profile-dropdown').classList.add('hidden');
}

// 🟢 Close Watch History Modal
function closeWatchHistory() {
    document.getElementById('watch-history-modal').classList.add('hidden');
}

// ========== SEARCH EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (e.target.value) {
                searchMovies(e.target.value);
            } else {
                loadApp();
            }
        });
    }
    
    if (genreFilter) {
        genreFilter.addEventListener('change', (e) => {
            filterByGenre(e.target.value);
        });
    }
});