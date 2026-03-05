// Supabase Configuration
const SUPABASE_URL = 'https://gsgoljfhmlqcfanxcgds.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-Do1oSuxsCvpfaB564V0eQ_Ern8LOtm';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const DEFAULT_CATEGORIES = [
    {
        id: 'restaurants',
        name: 'Restaurants',
        icon: 'fa-utensils',
        subcategories: ['Casual', 'Fine Dining', 'Cafe', 'Delivery']
    },
    {
        id: 'events',
        name: 'Events',
        icon: 'fa-ticket',
        subcategories: ['Concerts', 'Shows', 'Music', 'Theatre', 'Comedy', 'Exhibition']
    },
    {
        id: 'baby-stuff',
        name: 'Baby Stuff',
        icon: 'fa-baby',
        subcategories: ['Toys', 'Clothes', 'Gear', 'Health']
    }
];

let categories = [...DEFAULT_CATEGORIES];

let currentUser = null;
let savedContent = []; // Will be populated from Supabase
let galleryGrid, searchInput, emptyState, sidebarItems, quickFilters, pageTitle, clearFiltersBtn,
    sidebarCategories, categoryList, eventDateField, itemEventDate, mainFab, addCategoryBtn,
    categoriesNavMenu, contentModal, addContentModal,
    addCategoryModal, authOverlay, appContainer, signOutBtn, googleLoginBtn,
    mobileMenuBtn, sidebar, sidebarBackdrop, modalCloseBtn, modalBody,
    addContentForm, addCategoryForm, addContentClose, addCategoryClose,
    addContentCancel, addCategoryCancel, categoryIcons, categoryIconInput,
    settingsBtn, settingsModal, settingsClose, settingsCategoriesList,
    settingsSubcategoriesList, newCategoryName, saveNewCategoryBtn,
    newSubcategoryName, saveNewSubcategoryBtn, settingsDone,
    manageSubcategoriesSection, currentCategoryName,
    dialogModal, dialogTitle, dialogMessage, dialogFooter, closeDialog,
    profileTrigger, profileDropdown, userFirstName, userEmailDisp;

let selectedCategoryForSettingsId = null;

function cacheElements() {
    galleryGrid = document.getElementById('galleryGrid');
    searchInput = document.getElementById('searchInput');
    emptyState = document.getElementById('emptyState');
    sidebarItems = document.querySelectorAll('.nav-item');
    quickFilters = document.querySelectorAll('.pill');
    pageTitle = document.getElementById('pageTitle');
    clearFiltersBtn = document.querySelector('.clear-filters-btn');
    sidebarCategories = document.getElementById('sidebarCategories');
    categoryList = document.getElementById('categoryList');
    eventDateField = document.getElementById('eventDateField');
    itemEventDate = document.getElementById('itemEventDate');
    mainFab = document.getElementById('mainFab');
    addCategoryBtn = document.getElementById('addCategoryBtn');
    categoriesNavMenu = addCategoryBtn?.parentElement;
    contentModal = document.getElementById('contentModal');
    addContentModal = document.getElementById('addContentModal');
    addCategoryModal = document.getElementById('addCategoryModal');
    authOverlay = document.getElementById('authOverlay');
    appContainer = document.getElementById('appContainer');
    signOutBtn = document.getElementById('signOutBtn');
    googleLoginBtn = document.getElementById('googleLoginBtn');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    sidebar = document.querySelector('.sidebar');
    sidebarBackdrop = document.getElementById('sidebarBackdrop');
    modalCloseBtn = contentModal?.querySelector('.modal-close');
    modalBody = document.getElementById('modalBody');
    addContentForm = document.getElementById('addContentForm');
    addCategoryForm = document.getElementById('addCategoryForm');
    addContentClose = document.getElementById('addContentClose');
    addCategoryClose = document.getElementById('addCategoryClose');
    addContentCancel = document.getElementById('addContentCancel');
    addCategoryCancel = document.getElementById('addCategoryCancel');
    categoryIcons = document.querySelectorAll('.icon-btn');
    categoryIconInput = document.getElementById('categoryIcon');

    // Settings elements
    settingsBtn = document.getElementById('settingsBtn');
    settingsModal = document.getElementById('settingsModal');
    settingsClose = document.getElementById('settingsClose');
    settingsCategoriesList = document.getElementById('settingsCategoriesList');
    settingsSubcategoriesList = document.getElementById('settingsSubcategoriesList');
    newCategoryName = document.getElementById('newCategoryName');
    saveNewCategoryBtn = document.getElementById('saveNewCategoryBtn');
    newSubcategoryName = document.getElementById('newSubcategoryName');
    saveNewSubcategoryBtn = document.getElementById('saveNewSubcategoryBtn');
    settingsDone = document.getElementById('settingsDone');
    manageSubcategoriesSection = document.getElementById('manageSubcategoriesSection');
    currentCategoryName = document.getElementById('currentCategoryName');

    // Dialog elements
    dialogModal = document.getElementById('dialogModal');
    dialogTitle = document.getElementById('dialogTitle');
    dialogMessage = document.getElementById('dialogMessage');
    dialogFooter = document.getElementById('dialogFooter');
    closeDialog = document.getElementById('closeDialog');

    // Profile Dropdown elements
    profileTrigger = document.getElementById('profileTrigger');
    profileDropdown = document.getElementById('profileDropdown');
    userFirstName = document.getElementById('userFirstName');
    userEmailDisp = document.getElementById('userEmailDisp');
}

// Edit tracking state
let editingItemId = null;

// State
let currentFilter = 'all';
let currentSearchTerm = '';

// Icons mapping for sources
const sourceIcons = {
    instagram: 'fa-brands fa-instagram',
    youtube: 'fa-brands fa-youtube',
    article: 'fa-solid fa-globe'
};

// Format Date for Events
const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
        month: months[date.getMonth()],
        day: date.getDate(),
        year: date.getFullYear(),
        full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
};

// Curated category-to-image map using permanent Pexels CDN URLs (Replaced Unsplash as requested)
const CATEGORY_IMAGES = {
    'restaurants': 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
    'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'dining': 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
    'travel': 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
    'concert': 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'concerts-and-shows': 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'concerts & shows': 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'events': 'https://images.pexels.com/photos/167605/pexels-photo-167605.jpeg?auto=compress&cs=tinysrgb&w=800',
    'tech': 'https://images.pexels.com/photos/33092906/pexels-photo-33092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    'technology': 'https://images.pexels.com/photos/33092906/pexels-photo-33092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    'baby-stuff': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'baby stuff': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'baby-food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'formula': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'milk-powder': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'infant-formula': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'baby': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'kids': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'instagram': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'youtube': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'article': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'news': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'finance': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'crypto': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'shopping': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    'fashion': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    'fitness': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
    'health': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
    'education': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'music': 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'movies': 'https://images.pexels.com/photos/167605/pexels-photo-167605.jpeg?auto=compress&cs=tinysrgb&w=800',
    'sports': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
    'gaming': 'https://images.pexels.com/photos/33092906/pexels-photo-33092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    'art': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'design': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'architecture': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'nature': 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
    'pets': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'animals': 'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'cars': 'https://images.pexels.com/photos/33092906/pexels-photo-33092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    'books': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    'recipe': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'coding': 'https://images.pexels.com/photos/33092906/pexels-photo-33092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    'photography': 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
    'default': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800'
};

const KEYWORD_STOP_WORDS = new Set([
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'best', 'top', 'new', 'how', 'why', 'what', 'where', 'my', 'of',
    'with', 'from', 'this', 'that', 'your', 'our', 'is', 'are', 'by', 'as', 'it', 'you', 'we'
]);

const URL_NOISE_TOKENS = new Set([
    'dp', 'gp', 'product', 'ref', 'tag', 'qid', 'sr', 'psc', 'th', 'node', 'keywords', 'k', 's', 'sprefix', 'crid',
    'amazon', 'www', 'com', 'wwwamazoncom'
]);

const BABY_HINTS = new Set(['baby', 'infant', 'toddler', 'newborn', 'kid', 'kids', 'child']);
const FOOD_HINTS = new Set(['food', 'formula', 'milk', 'powder', 'snack', 'feeding', 'nutrition']);
const EVENT_HINTS = new Set(['concert', 'music', 'live', 'tour', 'show', 'theatre', 'ticket', 'festival', 'event']);
const STRICT_CONTEXT_IMAGES = {
    'baby-stuff|baby-food': [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/35501372/pexels-photo-35501372.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
};


// ===== Thumbnail Priority Pipeline =====
// 1) Platform thumbnail (YouTube / Instagram)
// 2) Microlink preview
// 3) OG scrape fallback
// 4) Category fallback

function normalizeCategory(value) {
    if (!value) return "";
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

function tokenizeText(value) {
    return (value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/[\s-]+/)
        .filter(Boolean);
}

function isTokenUseful(token) {
    if (!token) return false;
    if (token.length < 3) return false;
    if (KEYWORD_STOP_WORDS.has(token)) return false;
    if (URL_NOISE_TOKENS.has(token)) return false;
    if (/^b[0-9a-z]{8,}$/i.test(token)) return false; // Amazon-like ASIN tokens
    if (/^\d+$/.test(token)) return false;
    return true;
}

function extractContextKeywords({ url = '', title = '', category = '', subcategory = '' }) {
    let urlText = '';
    try {
        const parsed = new URL(url);
        urlText = `${decodeURIComponent(parsed.pathname || '')} ${decodeURIComponent(parsed.search || '')}`;
    } catch {
        urlText = '';
    }

    const merged = [
        ...tokenizeText(title),
        ...tokenizeText(subcategory),
        ...tokenizeText(category),
        ...tokenizeText(urlText)
    ];

    return [...new Set(merged.filter(isTokenUseful))];
}

function hasAnyKeyword(keywords, set) {
    return keywords.some((k) => set.has(k));
}

function inferSuggestedCategory({ category = '', subcategory = '', keywords = [] }) {
    if (category) return category;
    if (hasAnyKeyword(keywords, BABY_HINTS)) return 'Baby Stuff';
    if (hasAnyKeyword(keywords, EVENT_HINTS)) return 'Events';
    if (hasAnyKeyword(keywords, FOOD_HINTS)) return 'Restaurants';
    if (subcategory) return subcategory;
    return '';
}

function getMatchQualityScore(keyTokens, catTokens, subTokens) {
    const catOverlap = catTokens.filter((t) => keyTokens.includes(t)).length;
    const subOverlap = subTokens.filter((t) => keyTokens.includes(t)).length;
    return (catOverlap * 3) + (subOverlap * 3);
}

function getStrictContextImage(category = '', subcategory = '') {
    const catKey = normalizeCategory(category);
    const subKey = normalizeCategory(subcategory);

    if (catKey && subKey) {
        const combinedDirect = `${catKey}-${subKey}`;
        if (CATEGORY_IMAGES[combinedDirect]) return CATEGORY_IMAGES[combinedDirect];
    }

    if (catKey && subKey && CATEGORY_IMAGES['baby-food']) {
        const hasBaby = catKey.includes('baby');
        const hasFoodSub = ['food', 'formula', 'milk', 'powder', 'nutrition'].some((t) => subKey.includes(t));
        if (hasBaby && hasFoodSub) return CATEGORY_IMAGES['baby-food'];
    }

    const catTokens = catKey.split('-').filter(Boolean);
    const subTokens = subKey.split('-').filter(Boolean);
    const hasSub = subTokens.length > 0;

    let best = null;
    let bestScore = -1;

    Object.keys(CATEGORY_IMAGES).forEach((k) => {
        if (k === 'default') return;
        const keyTokens = normalizeCategory(k).split('-').filter(Boolean);
        const catMatched = catTokens.length === 0 || catTokens.some((t) => keyTokens.includes(t));
        const subMatched = subTokens.length === 0 || subTokens.some((t) => keyTokens.includes(t));
        const isStrict = hasSub ? (catMatched && subMatched) : catMatched;
        if (!isStrict) return;

        const score = getMatchQualityScore(keyTokens, catTokens, subTokens);
        if (score > bestScore) {
            best = CATEGORY_IMAGES[k];
            bestScore = score;
        }
    });

    if (best) return best;

    // If subcategory is present but no strict pair exists, avoid loose unrelated matches.
    if (hasSub) return CATEGORY_IMAGES.default;

    if (catKey && CATEGORY_IMAGES[catKey]) return CATEGORY_IMAGES[catKey];
    return CATEGORY_IMAGES.default;
}

function getStrictContextOptions(category = '', subcategory = '') {
    const catKey = normalizeCategory(category);
    const subKey = normalizeCategory(subcategory);
    const pairKey = `${catKey}|${subKey}`;

    if (STRICT_CONTEXT_IMAGES[pairKey]?.length) {
        return [...new Set(STRICT_CONTEXT_IMAGES[pairKey])];
    }

    const strictPrimary = getStrictContextImage(category, subcategory);
    const options = [strictPrimary];
    if (catKey && CATEGORY_IMAGES[catKey]) options.push(CATEGORY_IMAGES[catKey]);
    if (subKey && CATEGORY_IMAGES[subKey]) options.push(CATEGORY_IMAGES[subKey]);
    options.push(CATEGORY_IMAGES.default);

    return [...new Set(options.filter(Boolean))];
}

function detectPlatform(url) {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    return "generic";
}

function getYouTubeThumbnail(url) {
    try {
        let videoId = null;

        if (url.includes("watch?v=")) {
            videoId = url.split("v=")[1]?.split("&")[0] || null;
        }

        if (!videoId && url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || null;
        }

        if (!videoId && url.includes("/shorts/")) {
            videoId = url.split("/shorts/")[1]?.split("?")[0] || null;
        }

        if (!videoId) return null;
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch {
        return null;
    }
}

function getInstagramThumbnail(url) {
    try {
        const parts = url.split("/");
        const idIndex = parts.findIndex((p) => p === "p" || p === "reel");
        if (idIndex === -1) return null;

        const postId = parts[idIndex + 1];
        if (!postId) return null;

        return `https://www.instagram.com/p/${postId}/media/?size=l`;
    } catch {
        return null;
    }
}

async function fetchMicrolinkPreview(url) {
    try {
        const res = await fetch(
            `https://api.microlink.io/?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) return null;

        const data = await res.json();
        return data?.data?.image?.url || null;
    } catch {
        return null;
    }
}

async function scrapeOgImage(url) {
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) return null;

        const html = await response.text();

        const m1 = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i);
        if (m1?.[1]) return m1[1];

        const m2 = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        return m2?.[1] || null;
    } catch {
        return null;
    }
}

function getCategoryFallback(category, subcategory = '', title = '', url = '') {
    const strictImage = getStrictContextImage(category, subcategory);
    if (strictImage) return strictImage;

    const keys = [];
    const cat = normalizeCategory(category);
    const sub = normalizeCategory(subcategory);
    const keywords = extractContextKeywords({ url, title, category, subcategory });

    if (sub) keys.push(sub);
    if (cat) keys.push(cat);

    if (hasAnyKeyword(keywords, BABY_HINTS) && hasAnyKeyword(keywords, FOOD_HINTS)) {
        keys.push('baby-food', 'infant-formula', 'formula', 'milk-powder');
    }
    if (hasAnyKeyword(keywords, FOOD_HINTS)) keys.push('food');
    if (hasAnyKeyword(keywords, BABY_HINTS)) keys.push('baby-stuff', 'baby');
    if (hasAnyKeyword(keywords, EVENT_HINTS)) keys.push('events');

    for (const key of keys) {
        if (typeof CATEGORY_IMAGES !== "undefined" && CATEGORY_IMAGES?.[key]) {
            return CATEGORY_IMAGES[key];
        }
    }
    if (typeof CATEGORY_IMAGES !== "undefined" && CATEGORY_IMAGES?.default) {
        return CATEGORY_IMAGES.default;
    }
    return "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg";
}

async function getBestThumbnail(url, category, title, subcategory = '') {
    try {
        const strictMode = !!(category && subcategory);
        const platform = detectPlatform(url);

        if (platform === "youtube") {
            const yt = getYouTubeThumbnail(url);
            if (yt) return yt;
        }

        if (platform === "instagram") {
            const ig = getInstagramThumbnail(url);
            if (ig) return ig;
        }

        // In strict context mode, do not trust generic URL previews.
        if (strictMode) {
            return getCategoryFallback(category, subcategory, title, url);
        }

        const preview = await fetchMicrolinkPreview(url);
        if (preview) return preview;

        const og = await scrapeOgImage(url);
        if (og) return og;
    } catch (e) {
        console.warn("getBestThumbnail non-fatal error", e);
    }

    return getCategoryFallback(category, subcategory, title, url);
}

// Global image error handler for context-aware fallbacks
window.handleImageError = (img, itemId) => {
    const item = savedContent.find(i => String(i.id) === String(itemId));
    img.onerror = null; // Prevent infinite loops
    if (item) {
        img.src = getCategoryFallback(item.category, item.subcategory || '', item.title || '', item.url || '');
    } else {
        img.src = CATEGORY_IMAGES['default'];
    }
};

// Initialize App
async function init() {
    cacheElements();
    // Check for existing session
    if (supabaseClient) {
        // Use getUser() to get the freshest metadata from the server
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            await handleAuthStateChange(user);
        } else {
            showAuth();
        }

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // Fetch fresh user data on state change too
                const { data: { user: freshUser } } = await supabaseClient.auth.getUser();
                await handleAuthStateChange(freshUser || session.user);
            } else {
                showAuth();
            }
        });
    }

    // Event Listeners (setup once)
    addEventListeners();
    setupAutoSuggest();
    initTheme();

    // UI initial render (will show defaults if not logged in yet)
    renderCategories();
    renderQuickFilters();
    populateCategoryDatalist();
}

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('stash-theme') || 'default';
    applyTheme(savedTheme);

    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
}

function applyTheme(themeName) {
    // Remove all theme classes from body
    document.body.classList.remove('theme-dark');

    if (themeName === 'dark') {
        document.body.classList.add('theme-dark');
    }

    // Update active UI state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });

    localStorage.setItem('stash-theme', themeName);
}

function showAuth() {
    currentUser = null;
    savedContent = [];
    authOverlay.style.display = 'flex';
    appContainer.style.display = 'none';
    renderGallery([]); // Clear gallery
}

async function handleAuthStateChange(user) {
    if (!user) return;

    currentUser = user;
    authOverlay.style.display = 'none';
    appContainer.style.display = 'flex';

    // Load user-specific categories (Cloud sync)
    await loadCategories();

    // Refresh all UI components with new category data
    renderCategories();
    renderQuickFilters();
    populateCategoryDatalist();

    // Update profile info
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
    if (userFirstName) userFirstName.textContent = firstName;
    if (userEmailDisp) userEmailDisp.textContent = user.email;

    await fetchSavedContent();
}

async function fetchSavedContent() {
    if (!supabaseClient || !currentUser) return;

    const { data, error } = await supabaseClient
        .from('saved_content')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching content:', error);
        return;
    }

    savedContent = data || [];
    filterContent();
}

// Event Listeners
function addEventListeners() {
    // Search functionality
    searchInput?.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        filterContent();
    });

    addNavigationEventListeners();

    // Clear filters button in empty state
    clearFiltersBtn?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            currentSearchTerm = '';
        }

        // Trigger click on 'All' sidebar item
        const allFilter = document.querySelector('.nav-item[data-filter="all"]');
        if (allFilter) allFilter.click();
    });

    // Profile Dropdown Trigger
    profileTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown?.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileDropdown?.contains(e.target) && !profileTrigger?.contains(e.target)) {
            profileDropdown?.classList.remove('show');
        }
    });

    // Settings Modal
    settingsBtn?.addEventListener('click', openSettingsModal);
    settingsClose?.addEventListener('click', () => closeModal(settingsModal));
    settingsDone?.addEventListener('click', () => closeModal(settingsModal));

    saveNewCategoryBtn?.addEventListener('click', () => {
        const name = newCategoryName?.value.trim();
        if (name) {
            ensureCategoryExists(name);
            if (newCategoryName) newCategoryName.value = '';
            renderSettingsCategories();
        }
    });

    saveNewSubcategoryBtn?.addEventListener('click', async () => {
        const name = newSubcategoryName?.value.trim();
        if (name && selectedCategoryForSettingsId) {
            const cat = categories.find(c => c.id === selectedCategoryForSettingsId);
            if (cat) {
                if (!cat.subcategories) cat.subcategories = [];
                if (!cat.subcategories.includes(name)) {
                    cat.subcategories.push(name);
                    await saveCategories();
                    renderSettingsSubcategories(selectedCategoryForSettingsId);
                    renderCategories();
                    populateCategoryDatalist();
                }
                if (newSubcategoryName) newSubcategoryName.value = '';
            }
        }
    });
    // Auth Event Listeners
    signOutBtn?.addEventListener('click', async () => {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
    });

    googleLoginBtn?.addEventListener('click', async () => {
        console.log('Google login clicked');
        if (!supabaseClient) {
            console.error('Supabase client not initialized');
            alert('Supabase is not properly initialized. Check your project keys.');
            return;
        }

        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account'
                    }
                }
            });
            if (error) {
                console.error('Google login error:', error);
                alert('Google Login Error: ' + error.message);
            }
        } catch (err) {
            console.error('Unexpected error during Google login:', err);
            alert('An unexpected error occurred during login.');
        }
    });

    // Modal Close
    const closeBtns = [
        modalCloseBtn, settingsClose, settingsDone,
        addContentClose, addContentCancel,
        addCategoryClose, addCategoryCancel
    ];

    closeBtns.forEach(btn => {
        btn?.addEventListener('click', () => {
            closeModal(contentModal);
            closeModal(addContentModal);
            closeModal(addCategoryModal);
            closeModal(settingsModal);
        });
    });

    contentModal?.addEventListener('click', (e) => {
        if (e.target === contentModal) closeModal(contentModal);
    });

    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal(settingsModal);
    });

    addContentModal?.addEventListener('click', (e) => {
        if (e.target === addContentModal) closeModal(addContentModal);
    });

    addCategoryModal?.addEventListener('click', (e) => {
        if (e.target === addCategoryModal) closeModal(addCategoryModal);
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(contentModal);
            closeModal(addContentModal);
            closeModal(addCategoryModal);
            closeModal(settingsModal);
        }
    });

    // Add Content Modal Open
    mainFab?.addEventListener('click', () => {
        editingItemId = null;
        const modalTitle = document.querySelector('#addContentModal h2');
        if (modalTitle) modalTitle.textContent = 'Save New Item';
        addContentForm?.reset();
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemSubCategory').value = '';
        if (eventDateField) eventDateField.style.display = 'none';
        const subCategoryRow = document.getElementById('subCategoryRow');
        const thumbnailSelectionRow = document.getElementById('thumbnailSelectionRow');
        const selectedThumbnail = document.getElementById('selectedThumbnail');
        if (subCategoryRow) subCategoryRow.style.display = 'none';
        if (thumbnailSelectionRow) thumbnailSelectionRow.style.display = 'none';
        if (selectedThumbnail) selectedThumbnail.value = '';
        document.getElementById('otherCategoryInput').style.display = 'none';
        document.getElementById('otherSubCategoryInput').style.display = 'none';
        renderCategoryPills();
        openModal(addContentModal);
    });

    // Form Submissions
    addContentForm?.addEventListener('submit', handleAddContent);
    addCategoryForm?.addEventListener('submit', handleAddCategory);

    // Add Category Modal Listeners
    addCategoryBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        addCategoryForm?.reset();
        categoryIcons.forEach(i => i.classList.remove('active'));
        if (categoryIcons.length > 0) categoryIcons[0].classList.add('active');
        if (categoryIconInput) categoryIconInput.value = 'fa-folder';
        openModal(addCategoryModal);
    });

    // Icon Picker Logic
    categoryIcons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryIcons.forEach(i => i.classList.remove('active'));
            btn.classList.add('active');
            if (categoryIconInput) categoryIconInput.value = btn.getAttribute('data-icon');
        });
    });
    // Auto-suggest category icon while typing
    const categoryNameInput = document.getElementById('categoryName');
    categoryNameInput?.addEventListener('input', (e) => {
        const icon = getCategoryIcon(e.target.value);
        if (icon !== 'fa-folder') {
            categoryIcons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-icon') === icon) {
                    btn.classList.add('active');
                    if (categoryIconInput) categoryIconInput.value = icon;
                }
            });
        }
    });

    // Mobile Menu Toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarBackdrop.classList.add('active');
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            sidebar?.classList.remove('active');
            sidebarBackdrop?.classList.remove('active');
        });
    }

    // Theme selector (now in settings)
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
}

function addNavigationEventListeners() {
    // Refetch in case they were updated
    sidebarItems = document.querySelectorAll('.nav-item');
    quickFilters = document.querySelectorAll('.pill');

    // Sidebar navigation filters
    sidebarItems.forEach(item => {
        // Remove existing to prevent duplicates
        const new_item = item.cloneNode(true);
        item.parentNode.replaceChild(new_item, item);

        new_item.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedFilter = new_item.getAttribute('data-filter');

            // Toggle logic: If re-clicking active filter (and not 'all'), reset to 'all'
            if (currentFilter === clickedFilter && clickedFilter !== 'all') {
                currentFilter = 'all';
            } else {
                currentFilter = clickedFilter;
            }

            // Clear search when switching main filters
            currentSearchTerm = '';
            if (searchInput) searchInput.value = '';

            // Update sidebar active state
            sidebarItems = document.querySelectorAll('.nav-item');
            sidebarItems.forEach(i => {
                const itemFilter = i.getAttribute('data-filter');
                i.classList.remove('active');

                // SAFELY find subcategories: only if parent is a category container
                const subList = i.parentElement.classList.contains('nav-category-container') ?
                    i.parentElement.querySelector('.subcategory-list') : null;

                if (subList) subList.classList.remove('active');

                if (itemFilter === currentFilter) {
                    i.classList.add('active');
                    const spanContent = i.querySelector('span')?.textContent;
                    if (spanContent) pageTitle.textContent = spanContent;
                    if (subList) subList.classList.add('active');
                }
            });

            // Update pills
            quickFilters = document.querySelectorAll('.pill');
            quickFilters.forEach(pill => {
                pill.classList.remove('active');
                if (pill.getAttribute('data-filter') === currentFilter) {
                    pill.classList.add('active');
                }
            });

            filterContent();

            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
                sidebarBackdrop.classList.remove('active');
            }
        });
    });

    // Quick pills filters
    quickFilters.forEach(pill => {
        const new_pill = pill.cloneNode(true);
        pill.parentNode.replaceChild(new_pill, pill);

        new_pill.addEventListener('click', () => {
            const clickedFilter = new_pill.getAttribute('data-filter');

            // Toggle logic
            if (currentFilter === clickedFilter && clickedFilter !== 'all') {
                currentFilter = 'all';
            } else {
                currentFilter = clickedFilter;
            }

            // Sync pills
            quickFilters = document.querySelectorAll('.pill');
            quickFilters.forEach(p => {
                p.classList.remove('active');
                if (p.getAttribute('data-filter') === currentFilter) {
                    p.classList.add('active');
                }
            });

            // Sync sidebar
            sidebarItems = document.querySelectorAll('.nav-item');
            sidebarItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-filter') === currentFilter) {
                    item.classList.add('active');
                    pageTitle.textContent = item.querySelector('span').textContent;
                }
            });

            if (currentFilter === 'all') pageTitle.textContent = 'All Items';

            filterContent();
        });
    });
}

// Logic to detect content type and suggest category
function setupAutoSuggest() {
    const itemUrl = document.getElementById('itemUrl');
    const itemTitle = document.getElementById('itemTitle');
    const itemSource = document.getElementById('itemSource');
    const itemCategory = document.getElementById('itemCategory');
    const itemDescription = document.getElementById('itemDescription');
    const loader = document.getElementById('autoPopulateLoader');

    itemUrl?.addEventListener('blur', async () => {
        const url = itemUrl.value.toLowerCase().trim();
        if (!url) return;

        // Reset fields if it's a new URL
        if (!editingItemId) {
            if (loader) loader.style.display = 'block';

            // 1. Identify Source Automatically
            let detectedSource = 'article'; // Default to "Other Online Sources"
            if (url.includes('instagram.com')) detectedSource = 'instagram';
            else if (url.includes('youtube.com') || url.includes('youtu.be')) detectedSource = 'youtube';

            itemSource.value = detectedSource;

            // 2. Simulated Scraping Logic
            // In a real app, this would be a fetch to a backend service that scrapes metadata
            await new Promise(resolve => setTimeout(resolve, 800)); // Illusion of work

            // Try to extract a title, description and thumbnail
            let suggestThumbnail = '';
            let suggestedCategory = '';
            try {
                const urlObj = new URL(url);
                const hostname = urlObj.hostname.replace('www.', '').split('.')[0];
                const pathParts = urlObj.pathname.split('/').filter(p => p.length > 2);

                let title = '';
                if (pathParts.length > 0) {
                    const lastPart = pathParts[pathParts.length - 1];
                    title = lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                } else {
                    title = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                }

                if (title && !itemTitle.value) {
                    itemTitle.value = title;
                }

                // Auto-description
                if (!itemDescription.value) {
                    const sourceLabel = detectedSource === 'instagram' ? 'Instagram' :
                        detectedSource === 'youtube' ? 'YouTube' : hostname;
                    itemDescription.value = `${title} - Content shared from ${sourceLabel}.`;
                }

                // 3. Suggest Category based on extracted context keywords
                const currentSubCategory = document.getElementById('itemSubCategory')?.value || '';
                const keywords = extractContextKeywords({
                    url,
                    title,
                    category: itemCategory.value,
                    subcategory: currentSubCategory
                });
                suggestedCategory = inferSuggestedCategory({
                    category: itemCategory.value,
                    subcategory: currentSubCategory,
                    keywords
                });

                // 4. Image Fetching Logic
                suggestThumbnail = await getBestThumbnail(
                    url,
                    suggestedCategory || itemCategory.value,
                    title,
                    currentSubCategory
                );

                // Store suggestThumbnail in a data attribute to be picked up on save
                itemUrl.setAttribute('data-suggested-thumbnail', suggestThumbnail);

            } catch (e) {
                console.error("Error during auto-suggestion:", e);
                // Optionally, clear suggested thumbnail if an error occurred
                suggestThumbnail = '';
                itemUrl.removeAttribute('data-suggested-thumbnail');
            }

            if (suggestedCategory && !itemCategory.value) {
                // Programmatically select the matching category pill
                const catPills = document.querySelectorAll('#categoryPillsContainer .cat-pill');
                catPills.forEach(p => {
                    if (p.dataset.value === suggestedCategory) {
                        p.click();
                    }
                });
            }

            generateThumbnailOptions(suggestThumbnail);

            if (loader) loader.style.display = 'none';
        }
    });
}

function handleCategoryChange(categoryName) {
    if (!categoryName) return;

    // Toggle Event Dates (Event is now a category)
    const isEvent = categoryName.toLowerCase().includes('event') ||
        categoryName.toLowerCase().includes('concert') ||
        categoryName.toLowerCase().includes('show');

    if (isEvent) {
        if (eventDateField) eventDateField.style.display = 'block';
    } else {
        if (eventDateField) eventDateField.style.display = 'none';
    }

    updateSubcategoryDatalist(categoryName);
}

function updateSubcategoryPills(categoryName) {
    const subCategoryRow = document.getElementById('subCategoryRow');
    const subCategoryPills = document.getElementById('subCategoryPillsContainer');
    const hiddenSubInput = document.getElementById('itemSubCategory');
    const otherSubInput = document.getElementById('otherSubCategoryInput');

    if (!categoryName) {
        if (subCategoryRow) subCategoryRow.style.display = 'none';
        return;
    }

    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    const predefinedSubs = category?.subcategories || [];

    if (predefinedSubs.length === 0) {
        // No subcategories defined, hide the row
        if (subCategoryRow) subCategoryRow.style.display = 'none';
        if (hiddenSubInput) hiddenSubInput.value = '';
        return;
    }

    subCategoryRow.style.display = 'block';
    if (otherSubInput) otherSubInput.style.display = 'none';
    if (hiddenSubInput) hiddenSubInput.value = '';

    const allSubs = [...predefinedSubs];
    subCategoryPills.innerHTML = allSubs.map(sub =>
        `<button type="button" class="form-pill sub-pill" data-value="${sub}">${sub}</button>`
    ).join('') + `<button type="button" class="form-pill others-pill sub-pill" data-value="__others__">+ Others</button>`;

    // Attach click handlers
    subCategoryPills.querySelectorAll('.sub-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            subCategoryPills.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (pill.dataset.value === '__others__') {
                otherSubInput.style.display = 'block';
                const otherText = document.getElementById('otherSubCategoryText');
                otherText.value = '';
                otherText.focus();
                hiddenSubInput.value = '';
                // Update on typing
                otherText.oninput = () => {
                    hiddenSubInput.value = otherText.value;
                    generateThumbnailOptions();
                };
            } else {
                otherSubInput.style.display = 'none';
                hiddenSubInput.value = pill.dataset.value;
                generateThumbnailOptions();
            }
        });
    });
}


// Render category pills in the add/edit form
function renderCategoryPills(preselectedCategory = '') {
    const container = document.getElementById('categoryPillsContainer');
    const hiddenInput = document.getElementById('itemCategory');
    const otherCatInput = document.getElementById('otherCategoryInput');

    if (!container) return;

    container.innerHTML = categories.map(cat =>
        `<button type="button" class="form-pill cat-pill${preselectedCategory && cat.name.toLowerCase() === preselectedCategory.toLowerCase() ? ' active' : ''}" data-value="${cat.name}">${cat.name}</button>`
    ).join('') + `<button type="button" class="form-pill others-pill cat-pill${preselectedCategory && !categories.find(c => c.name.toLowerCase() === preselectedCategory.toLowerCase()) && preselectedCategory ? ' active' : ''}" data-value="__others__">+ Others</button>`;

    // Pre-set value if editing
    if (preselectedCategory) {
        const matchedCat = categories.find(c => c.name.toLowerCase() === preselectedCategory.toLowerCase());
        if (matchedCat) {
            hiddenInput.value = matchedCat.name;
        } else {
            hiddenInput.value = preselectedCategory;
            otherCatInput.style.display = 'block';
            document.getElementById('otherCategoryText').value = preselectedCategory;
        }
    }

    // Attach click handlers
    container.querySelectorAll('.cat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            container.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (pill.dataset.value === '__others__') {
                otherCatInput.style.display = 'block';
                const otherText = document.getElementById('otherCategoryText');
                otherText.value = '';
                otherText.focus();
                hiddenInput.value = '';
                // Update hidden input on typing
                otherText.oninput = () => {
                    hiddenInput.value = otherText.value;
                    // Show event fields if relevant
                    handleCategorySelection(otherText.value);
                };
                // Hide subcategory pills since this is a new category
                const subCategoryRow = document.getElementById('subCategoryRow');
                if (subCategoryRow) subCategoryRow.style.display = 'none';
            } else {
                otherCatInput.style.display = 'none';
                hiddenInput.value = pill.dataset.value;
                handleCategorySelection(pill.dataset.value);
            }
        });
    });
}

function handleCategorySelection(categoryName) {
    // Show/hide event date fields
    const eventDateField = document.getElementById('eventDateField');
    if (categoryName) {
        const isEvent = categoryName.toLowerCase().includes('event') ||
            categoryName.toLowerCase().includes('concert') ||
            categoryName.toLowerCase().includes('show');
        if (eventDateField) eventDateField.style.display = isEvent ? 'block' : 'none';
    } else {
        if (eventDateField) eventDateField.style.display = 'none';
    }

    // Update subcategory pills
    updateSubcategoryPills(categoryName);
    generateThumbnailOptions();
}

function generateThumbnailOptions(primarySuggest = '') {
    const url = document.getElementById('itemUrl').value;
    const title = document.getElementById('itemTitle').value;
    const cat = document.getElementById('itemCategory').value;
    const subCat = document.getElementById('itemSubCategory')?.value;

    const container = document.getElementById('thumbnailOptionsContainer');
    const row = document.getElementById('thumbnailSelectionRow');
    const selectedThumbInput = document.getElementById('selectedThumbnail');

    if (!container || !row || !selectedThumbInput) return;

    if (!url && !cat && !title) {
        row.style.display = 'none';
        return;
    }

    let safeKeywords = extractContextKeywords({
        url,
        title,
        category: cat,
        subcategory: subCat
    });
    if (safeKeywords.length === 0) safeKeywords = ['default'];

    row.style.display = 'block';
    container.innerHTML = '';

    const options = [];

    const platform = detectPlatform(url);
    const hasSubcategory = !!(subCat && subCat.trim());
    const hasCategory = !!(cat && cat.trim());
    const isStrictMode = hasCategory && hasSubcategory;

    const pushDeterministicOption = (imageUrl) => {
        if (!imageUrl) return;
        if (options.some(o => o.url === imageUrl)) return;
        options.push({ url: imageUrl, isAi: false });
    };

    // 1. URL/Platform Priority
    // Keep YouTube/Instagram platform thumbnails regardless of strict mode
    const isPlatform = platform === 'youtube' || platform === 'instagram';
    if (primarySuggest && (isPlatform || !isStrictMode)) {
        options.push({ url: primarySuggest, isAi: false });
    }

    // 2. Contextual Suggestions
    if (isStrictMode) {
        // Suggested images must come from strict Category+Subcategory context options only
        getStrictContextOptions(cat, subCat).forEach(pushDeterministicOption);
    } else {
        // Broaden context when subcategory is not selected or metadata is weak
        pushDeterministicOption(getCategoryFallback(cat, subCat, title, url));

        if (hasCategory) {
            pushDeterministicOption(getCategoryFallback(cat, '', title, url));
        }

        safeKeywords.slice(0, 4).forEach((kw) => {
            pushDeterministicOption(getCategoryFallback(kw, '', title, url));
        });

        // Ensure safe choices
        ['food', 'baby-stuff', 'default'].forEach((fallbackKey) => {
            pushDeterministicOption(CATEGORY_IMAGES[fallbackKey] || CATEGORY_IMAGES.default);
        });
    }

    options.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.className = 'thumbnail-option';
        if (idx === 0) div.classList.add('active'); // auto select the first one

        const img = document.createElement('img');
        img.src = opt.url;
        img.crossOrigin = 'anonymous';

        div.appendChild(img);

        // Safe fallback to deterministic category image on load errors
        img.onerror = () => {
            img.src = getCategoryFallback(cat, subCat, title, url);
        };

        div.addEventListener('click', () => {
            container.querySelectorAll('.thumbnail-option').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            selectedThumbInput.value = opt.url;
        });

        container.appendChild(div);
    });

    if (options.length > 0) {
        selectedThumbInput.value = options[0].url;
    }
}

function populateCategoryDatalist() {
    // No longer needed - pills are used instead
    // Kept as a no-op for backward compatibility with existing calls
}

function getCategoryIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('food') || n.includes('restaurant') || n.includes('dine') || n.includes('cafe') || n.includes('dining')) return 'fa-utensils';
    if (n.includes('concert') || n.includes('music') || n.includes('show') || n.includes('comedy') || n.includes('theatre') || n.includes('theat') || n.includes('event') || n.includes('ticket')) return 'fa-ticket';
    if (n.includes('baby') || n.includes('kid') || n.includes('child')) return 'fa-baby';
    if (n.includes('travel') || n.includes('trip') || n.includes('flight') || n.includes('hotel')) return 'fa-plane';
    if (n.includes('shopping') || n.includes('shop') || n.includes('buy') || n.includes('store')) return 'fa-cart-shopping';
    if (n.includes('movie') || n.includes('video') || n.includes('film') || n.includes('cinema') || n.includes('netflix') || n.includes('watch')) return 'fa-film';
    if (n.includes('book') || n.includes('read') || n.includes('library') || n.includes('article') || n.includes('paper')) return 'fa-book';
    if (n.includes('health') || n.includes('fit') || n.includes('gym') || n.includes('med') || n.includes('workout') || n.includes('sport')) return 'fa-heart-pulse';
    return 'fa-folder';
}

// Logic to render categories dynamically
function renderCategories() {
    if (!sidebarCategories) return;
    sidebarCategories.innerHTML = '';

    categories.forEach(cat => {
        const catContainer = document.createElement('div');
        catContainer.className = 'nav-category-container';

        const a = document.createElement('a');
        a.href = "#";
        a.className = "nav-item";
        if (currentFilter === cat.id) a.classList.add('active');
        a.setAttribute('data-filter', cat.id);

        // Use dynamically suggested icon if it's a folder or if we recognize name
        const iconClass = cat.icon === 'fa-folder' ? getCategoryIcon(cat.name) : cat.icon;

        a.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${cat.name}</span>
        `;

        catContainer.appendChild(a);

        // Subcategories list (Always render div if it matches or has subs to avoid missing elements)
        const hasSubs = cat.subcategories && cat.subcategories.length > 0;
        const subList = document.createElement('div');
        subList.className = 'subcategory-list';
        subList.id = `sub-${cat.id}`;
        if (currentFilter === cat.id) subList.classList.add('active');

        // Always include "Others" as the user requested subcategories to be visible
        const subsToRender = [...(cat.subcategories || []), 'Others'];

        subsToRender.forEach(sub => {
            const subA = document.createElement('a');
            subA.href = "#";
            subA.className = "subcategory-item";
            if (currentSearchTerm === sub) subA.classList.add('active');
            subA.textContent = sub;
            subA.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentSearchTerm = sub;
                if (searchInput) searchInput.value = sub;
                filterContent();

                // Keep the parent category active
                currentFilter = cat.id;
                renderCategories();
            });
            subList.appendChild(subA);
        });

        catContainer.appendChild(subList);
        sidebarCategories.appendChild(catContainer);
    });

    // Re-attach listeners since we just replaced the elements
    addNavigationEventListeners();
}

function renderQuickFilters() {
    const quickFiltersContainer = document.getElementById('quickFilters');

    quickFiltersContainer.innerHTML = `
        <button class="pill active" data-filter="all">All</button>
        ${categories.map(cat => `<button class="pill" data-filter="${cat.id}">${cat.name}</button>`).join('')}
    `;

    addNavigationEventListeners();
}

function populateCategoryDropdown() {
    const select = document.getElementById('itemCategory');
    select.innerHTML = categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

// Handle Adding/Editing Content
async function handleAddContent(e) {
    if (!supabaseClient || !currentUser) return;
    e.preventDefault();

    const submittedData = {
        title: document.getElementById('itemTitle').value,
        url: document.getElementById('itemUrl').value,
        source: document.getElementById('itemSource').value,
        category: document.getElementById('itemCategory').value,
        subcategory: document.getElementById('itemSubCategory')?.value || null,
        description: document.getElementById('itemDescription').value,
        event_date: document.getElementById('itemEventDate').value || null,
        event_end_date: document.getElementById('itemEventEndDate')?.value || null,
        user_id: currentUser.id
    };

    // Validation for Events (Category based)
    const isEvent = submittedData.category.toLowerCase().includes('event') ||
        submittedData.category.toLowerCase().includes('concert') ||
        submittedData.category.toLowerCase().includes('show');

    if (isEvent && (!submittedData.event_date || !submittedData.event_end_date)) {
        await showDialog({ title: 'Missing Information', message: 'Start Date and End Date are mandatory for Events.' });
        return;
    }

    // Clone the data for Supabase, but only include relevant fields
    const dbPayload = {
        title: submittedData.title,
        url: submittedData.url,
        source: submittedData.source,
        category: submittedData.category,
        subcategory: submittedData.subcategory,
        description: submittedData.description,
        user_id: submittedData.user_id
    };

    // ONLY include event-related fields if it's an event category
    if (isEvent) {
        dbPayload.event_date = submittedData.event_date;
        dbPayload.event_end_date = submittedData.event_end_date;
    }

    // Handle thumbnail: use selected one if available natively, otherwise compute pipeline
    const userSelectedThumbnail = document.getElementById('selectedThumbnail')?.value;
    const oldSuggestedThumbnail = document.getElementById('itemUrl')?.getAttribute('data-suggested-thumbnail');

    // Natively chosen thumbnail in current session
    if (userSelectedThumbnail && oldSuggestedThumbnail && userSelectedThumbnail !== oldSuggestedThumbnail) {
        dbPayload.thumbnail = userSelectedThumbnail;
    } else {
        // Evaluate the thumbnail through the rigid save-time pipeline
        dbPayload.thumbnail = await getBestThumbnail(
            dbPayload.url,
            dbPayload.category,
            dbPayload.title,
            dbPayload.subcategory || ''
        );
    }

    try {
        if (editingItemId) {
            // Update existing
            const { error } = await supabaseClient
                .from('saved_content')
                .update(dbPayload)
                .eq('id', editingItemId)
                .eq('user_id', currentUser.id);

            if (error) throw error;
        } else {
            // Create new
            const { error } = await supabaseClient
                .from('saved_content')
                .insert([dbPayload]);

            if (error) throw error;
        }

        // Close the modal first
        closeModal(addContentModal);

        // Force body overflow reset (critical for mobile)
        document.body.style.overflow = '';

        // Reset filters so the new card is guaranteed visible
        currentFilter = 'all';
        currentSearchTerm = '';
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        const allPill = document.querySelector('.pill[data-filter="all"]');
        if (allPill) allPill.classList.add('active');
        document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
        const allItemsSidebar = document.querySelector('.sidebar-item[data-category="all"]');
        if (allItemsSidebar) allItemsSidebar.classList.add('active');

        // CRITICAL: Refresh gallery FIRST, before any auth.updateUser calls
        // This avoids the Supabase auth lock conflict
        try {
            await fetchSavedContent();
        } catch (fetchErr) {
            console.error('Gallery refresh error:', fetchErr);
        }

        // Scroll to top
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);

        // THEN sync categories to cloud (fire-and-forget, don't block UI)
        if (submittedData.category) {
            ensureCategoryExists(submittedData.category, submittedData.subcategory)
                .catch(e => console.error('Category sync error:', e));
        }
    } catch (error) {
        console.error('Save error:', error);
        // Ensure modal closes and overflow resets even on error
        closeModal(addContentModal);
        document.body.style.overflow = '';
        await showDialog({ title: 'Error Saving Content', message: error.message });
    }
}

async function ensureCategoryExists(categoryName, subcategoryName = null) {
    if (!categoryName) return;

    let catIndex = categories.findIndex(c => c.id === categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-') || c.name === categoryName);

    if (catIndex === -1) {
        // Create new category if it doesn't exist
        const newCat = {
            id: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: categoryName,
            icon: 'fa-solid fa-folder', // Generic icon
            subcategories: []
        };
        if (subcategoryName && subcategoryName !== 'Others') {
            newCat.subcategories.push(subcategoryName);
        }
        categories.push(newCat);
    } else if (subcategoryName && subcategoryName !== 'Others') {
        // Add new subcategory to existing category if it doesn't exist
        if (!categories[catIndex].subcategories) categories[catIndex].subcategories = [];
        if (!categories[catIndex].subcategories.includes(subcategoryName)) {
            categories[catIndex].subcategories.push(subcategoryName);
        }
    }

    await saveCategories();
    // Rerender UI components
    renderCategories();
    renderQuickFilters();
    populateCategoryDatalist();
}

function openSettingsModal() {
    renderSettingsCategories();
    // Reset subcategories view
    if (manageSubcategoriesSection) manageSubcategoriesSection.style.display = 'none';
    selectedCategoryForSettingsId = null;
    openModal(settingsModal);
}

function renderSettingsCategories() {
    if (!settingsCategoriesList) return;

    settingsCategoriesList.innerHTML = categories.map(cat => `
        <div class="settings-list-item" data-id="${cat.id}">
            <div class="drag-handle">
                <i class="fa-solid fa-grip-vertical"></i>
            </div>
            <span>${cat.name}</span>
            <div class="settings-item-actions">
                <button class="settings-action-btn" title="Manage Subcategories" onclick="window.manageSubcategories('${cat.id}')">
                    <i class="fa-solid fa-list-check"></i>
                </button>
                <button class="settings-action-btn" title="Rename" onclick="window.renameCategory('${cat.id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="settings-action-btn delete" title="Delete" onclick="window.deleteCategory('${cat.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Initialize Sortable for Categories
    if (window.Sortable) {
        new window.Sortable(settingsCategoriesList, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: async function (evt) {
                const reorderedCategories = [];
                settingsCategoriesList.querySelectorAll('.settings-list-item').forEach(item => {
                    const id = item.getAttribute('data-id');
                    const cat = categories.find(c => c.id === id);
                    if (cat) reorderedCategories.push(cat);
                });
                categories = reorderedCategories;
                await saveCategories();
                renderCategories();
            }
        });
    }
}

// Attach these to window so onclick works
window.manageSubcategories = (catId) => {
    selectedCategoryForSettingsId = catId;
    const cat = categories.find(c => c.id === catId);
    if (cat) {
        if (currentCategoryName) currentCategoryName.textContent = cat.name;
        if (manageSubcategoriesSection) manageSubcategoriesSection.style.display = 'block';
        renderSettingsSubcategories(catId);
    }
};

window.renameCategory = async (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const newName = prompt('Enter new name for ' + cat.name, cat.name);
    if (newName && newName.trim()) {
        cat.name = newName.trim();
        saveCategories();
        renderSettingsCategories();
        renderCategories();
        populateCategoryDatalist();
    }
};

window.deleteCategory = async (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const confirmed = await showDialog({
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "${cat.name}" and all its subcategories?`,
        showCancel: true
    });

    if (confirmed) {
        categories = categories.filter(c => c.id !== catId);
        saveCategories();
        renderSettingsCategories();
        renderCategories();
        populateCategoryDatalist();
        if (selectedCategoryForSettingsId === catId) {
            if (manageSubcategoriesSection) manageSubcategoriesSection.style.display = 'none';
        }
    }
};

function renderSettingsSubcategories(catId) {
    const cat = categories.find(c => c.id === catId);
    if (!cat || !settingsSubcategoriesList) return;

    const subs = cat.subcategories || [];
    settingsSubcategoriesList.innerHTML = subs.map(sub => `
        <div class="settings-list-item" data-name="${sub}">
            <div class="drag-handle">
                <i class="fa-solid fa-grip-vertical"></i>
            </div>
            <span>${sub}</span>
            <div class="settings-item-actions">
                <button class="settings-action-btn" title="Rename Subcategory" onclick="window.renameSubcategory('${catId}', '${sub}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="settings-action-btn delete" title="Delete Subcategory" onclick="window.deleteSubcategory('${catId}', '${sub}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Initialize Sortable for Subcategories
    if (window.Sortable) {
        new window.Sortable(settingsSubcategoriesList, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: async function (evt) {
                const reorderedSubs = [];
                settingsSubcategoriesList.querySelectorAll('.settings-list-item').forEach(item => {
                    reorderedSubs.push(item.getAttribute('data-name'));
                });
                cat.subcategories = reorderedSubs;
                await saveCategories();
                renderCategories();
            }
        });
    }
}

window.renameSubcategory = async (catId, oldName) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const newName = prompt('Enter new subcategory name for ' + oldName, oldName);
    if (newName && newName.trim() && newName !== oldName) {
        const idx = cat.subcategories.indexOf(oldName);
        if (idx !== -1) {
            cat.subcategories[idx] = newName.trim();
            saveCategories();
            renderSettingsSubcategories(catId);
            renderCategories();
            populateCategoryDatalist();
        }
    }
};

window.deleteSubcategory = async (catId, subName) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const confirmed = await showDialog({
        title: 'Delete Subcategory',
        message: `Are you sure you want to delete the subcategory "${subName}"?`,
        showCancel: true
    });

    if (confirmed) {
        cat.subcategories = cat.subcategories.filter(s => s !== subName);
        saveCategories();
        renderSettingsSubcategories(catId);
        renderCategories();
        populateCategoryDatalist();
    }
};

async function saveCategories() {
    if (!currentUser) return;

    // Save to local storage for immediate persistence/offline fallback
    localStorage.setItem(`stash-categories-${currentUser.id}`, JSON.stringify(categories));

    // Sync to Supabase cloud metadata for cross-device persistence
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.updateUser({
                data: { custom_categories: categories }
            });
            if (error) throw error;
            // Update local currentUser to keep metadata in sync
            if (data?.user) currentUser = data.user;
        } catch (e) {
            console.error('Error syncing categories to cloud:', e);
        }
    }
}

async function loadCategories() {
    if (!currentUser) {
        categories = [...DEFAULT_CATEGORIES];
        return;
    }

    // 1. Try cloud metadata first (Source of Truth for cross-device sync)
    const cloudCategories = currentUser.user_metadata?.custom_categories;
    if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
        categories = cloudCategories;
        // Sync to local storage for offline use
        localStorage.setItem(`stash-categories-${currentUser.id}`, JSON.stringify(categories));
        return;
    }

    // 2. Fallback to Local Storage (Useful for offline or migration)
    const saved = localStorage.getItem(`stash-categories-${currentUser.id}`);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                categories = parsed;
                // Important: Initial migration to cloud if cloud was empty
                saveCategories();
                return;
            }
        } catch (e) {
            console.error('Error loading categories from localStorage:', e);
        }
    }

    // 3. Fallback to Default
    categories = [...DEFAULT_CATEGORIES];
}

// Handle Adding Categories
async function handleAddCategory(e) {
    e.preventDefault();

    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Add to state with empty subcategories list
    categories.push({ id, name, icon, subcategories: [] });
    await saveCategories();

    // Rerender UI components that depend on categories
    renderCategories();
    renderQuickFilters();
    populateCategoryDatalist();

    closeModal(addCategoryModal);
}

// Logic to delete an item
async function deleteItem(id) {
    if (!supabaseClient || !currentUser) return;

    const confirmed = await showDialog({
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        showCancel: true
    });

    if (confirmed) {
        try {
            const { error } = await supabaseClient
                .from('saved_content')
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            // Optional cleanup if modal was open during deletion
            const contentModal = document.getElementById('contentModal');
            if (contentModal && contentModal.classList.contains('active')) {
                closeModal(contentModal);
            }

            await fetchSavedContent();
        } catch (error) {
            await showDialog({ title: 'Delete Failed', message: 'Error deleting item: ' + error.message });
        }
    }
}

// Logic to load item into edit form
function editItem(id) {
    const item = savedContent.find(i => i.id == id);
    if (!item) return;

    editingItemId = id;

    document.querySelector('#addContentModal h2').textContent = 'Edit Item';
    document.getElementById('itemTitle').value = item.title;
    document.getElementById('itemUrl').value = item.url;
    document.getElementById('itemSource').value = item.source;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemEventDate').value = item.event_date || '';
    document.getElementById('itemEventEndDate').value = item.event_end_date || '';

    // Render category pills, which automatically handles the hidden category input 
    // and populates the subcategory pills.
    renderCategoryPills(item.category);

    // Pre-select the appropriate subcategory pill if one is set
    if (item.subcategory) {
        const subCategoryPillsContainer = document.getElementById('subCategoryPillsContainer');
        const hiddenSubInput = document.getElementById('itemSubCategory');
        const otherSubInput = document.getElementById('otherSubCategoryInput');
        const otherSubText = document.getElementById('otherSubCategoryText');

        let foundSub = false;
        if (subCategoryPillsContainer) {
            subCategoryPillsContainer.querySelectorAll('.sub-pill').forEach(pill => {
                if (pill.dataset.value === item.subcategory) {
                    pill.classList.add('active');
                    foundSub = true;
                }
            });

            if (!foundSub) {
                // It's a custom subcategory (via "Others")
                const othersPill = subCategoryPillsContainer.querySelector('.others-pill');
                if (othersPill) othersPill.classList.add('active');
                if (otherSubInput) otherSubInput.style.display = 'block';
                if (otherSubText) {
                    otherSubText.value = item.subcategory;
                    // Ensure the hidden input follows the text if the user edits it again while modal is open
                    otherSubText.oninput = () => { hiddenSubInput.value = otherSubText.value; };
                }
            }
            hiddenSubInput.value = item.subcategory;
        }
    }

    const thumbnailSelectionRow = document.getElementById('thumbnailSelectionRow');
    const selectedThumbnail = document.getElementById('selectedThumbnail');
    if (thumbnailSelectionRow) thumbnailSelectionRow.style.display = 'none';
    if (selectedThumbnail) selectedThumbnail.value = '';

    openModal(addContentModal);
}

// Filter logic combining search and category/source
function filterContent() {
    let filtered = savedContent;

    // Apply category/source filter
    if (currentFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(item => {
            if (currentFilter === 'upcoming') {
                return item.event_date && new Date(item.event_date) >= now;
            }
            if (currentFilter === 'ended') {
                return item.event_date && new Date(item.event_date) < now;
            }

            // Match source or category (normalized)
            const itemCat = (item.category || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
            return item.source === currentFilter || itemCat === currentFilter ||
                (currentFilter === 'events' && itemCat.includes('event')) ||
                (currentFilter === 'event' && itemCat.includes('event'));
        });
    }

    // Apply search filter (comma separated = OR logic)
    if (currentSearchTerm) {
        const searchTerms = currentSearchTerm.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

        filtered = filtered.filter(item => {
            const searchableText = `
                ${item.title || ''} 
                ${item.author || ''} 
                ${item.description || ''} 
                ${(item.tags || []).join(' ')}
                ${item.category || ''}
                ${item.subcategory || ''}
                ${item.source || ''}
            `.toLowerCase();

            return searchTerms.some(term => searchableText.includes(term));
        });
    }

    renderGallery(filtered);
}

// Render the grid of cards
function renderGallery(items) {
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
        galleryGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    galleryGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    items.forEach(item => {
        const dateInfo = formatDate(item.date || item.created_at);

        // Build card HTML
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', item.id);

        // Handle special visual elements based on source
        let specialMarkup = '';
        let metaMarkup = '';

        const isEventCategory = (item.category || '').toLowerCase().includes('event') ||
            (item.category || '').toLowerCase().includes('concert') ||
            (item.category || '').toLowerCase().includes('show');

        // Use Start Date if provided for the badge, otherwise fallback to item date
        const cardDateInfo = (isEventCategory && item.event_date) ? formatDate(item.event_date) : dateInfo;

        if (isEventCategory && item.event_date) {
            const endDateInfo = formatDate(item.event_end_date || item.event_date);
            specialMarkup = `
                <div class="event-date-badge">
                    <span class="event-month">${cardDateInfo.month}</span>
                    <span class="event-day">${cardDateInfo.day}</span>
                </div>
            `;
            metaMarkup = `<span><i class="fa-regular fa-calendar"></i> ${cardDateInfo.full} - ${endDateInfo.full}</span>`;
        } else if (item.source === 'youtube') {
            metaMarkup = `<span><i class="fa-regular fa-clock"></i> ${item.duration || 'Video'}</span>`;
        } else if (item.source === 'article') {
            metaMarkup = `<span><i class="fa-regular fa-clock"></i> ${item.readTime || 'Article'}</span>`;
        } else {
            metaMarkup = `<span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>`;
        }

        card.innerHTML = `
            <div class="card-media">
                <div class="card-overlay"></div>
                <div class="source-icon ${item.source}">
                    <i class="${sourceIcons[item.source] || 'fa-solid fa-globe'}"></i>
                </div>
                ${specialMarkup}
                <img src="${item.thumbnail || getCategoryFallback(item.category)}" alt="${item.title}" loading="lazy" onerror="window.handleImageError(this, '${item.id}')">
            </div>
            <div class="card-content">
                <span class="card-category">${item.category}${item.subcategory ? ' • ' + item.subcategory : ''}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.description}</p>
                
                <div class="card-footer">
                    <div class="card-meta">
                        ${metaMarkup}
                    </div>
                    <div class="card-actions">
                        <button class="action-btn share-btn" title="Share" data-id="${item.id}"><i class="fa-regular fa-share-from-square"></i></button>
                        <button class="action-btn edit-btn" title="Edit" data-id="${item.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" title="Delete" data-id="${item.id}" style="color: #ef4444;"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `;

        // Add click listener to open modal (ignore action buttons)
        card.addEventListener('click', async (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();

                const id = btn.getAttribute('data-id');
                if (btn.classList.contains('delete-btn')) {
                    await deleteItem(id);
                } else if (btn.classList.contains('edit-btn')) {
                    editItem(id);
                } else if (btn.classList.contains('share-btn')) {
                    await showDialog({ title: 'Share', message: 'Sharing feature coming soon!' });
                }
                return;
            }
            openContentModal(item);
        });

        galleryGrid.appendChild(card);
    });
}

// Modal Functions
function openContentModal(item) {
    const isEventCategory = (item.category || '').toLowerCase().includes('event') ||
        (item.category || '').toLowerCase().includes('concert') ||
        (item.category || '').toLowerCase().includes('show');

    // For events, use the event_date, otherwise use creation date
    const dateValue = (isEventCategory && item.event_date) ? item.event_date : (item.date || item.created_at);
    const dateInfo = formatDate(dateValue);
    let metaHTML = '';
    let actionBtnHTML = '';

    // Customize modal content based on source type
    // Already calculated above

    if (item.source === 'youtube') {
        metaHTML = `
            <span><i class="fa-regular fa-user"></i> ${item.author || 'Author'}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
            <span><i class="fa-regular fa-clock"></i> ${item.duration || 'Video'}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-brands fa-youtube"></i> Watch on YouTube</a>`;
    } else if (item.source === 'instagram') {
        metaHTML = `
            <span><i class="fa-brands fa-instagram"></i> ${item.author || 'Author'}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-brands fa-instagram"></i> View Post</a>`;
    } else if (item.source === 'article') {
        metaHTML = `
            <span><i class="fa-regular fa-user"></i> ${item.author || 'Author'}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
            <span><i class="fa-regular fa-clock"></i> ${item.readTime || 'Read Time'}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-solid fa-book-open"></i> View Content</a>`;
    }

    if (isEventCategory && item.event_date) {
        const endDateInfo = item.event_end_date ? formatDate(item.event_end_date) : null;
        metaHTML += `
            <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Location'}</span>
            <span><i class="fa-regular fa-calendar-check"></i> ${dateInfo.full}${endDateInfo ? ' - ' + endDateInfo.full : ''}</span>
        `;
    }

    modalBody.innerHTML = `
        <div class="detail-view">
            <div class="detail-media">
                <img src="${item.thumbnail || getCategoryFallback(item.category)}" alt="${item.title}" onerror="this.onerror=null;this.src='${getCategoryFallback(item.category)}';">
            </div>
            <div class="detail-content">
                <div class="detail-source-badge ${item.source}">
                    <i class="${sourceIcons[item.source]}"></i>
                    <span>${item.source.charAt(0).toUpperCase() + item.source.slice(1)}</span>
                </div>
                <h2 class="detail-title">${item.title}</h2>
                <div class="detail-meta">
                    ${metaHTML}
                </div>
                <div class="detail-description">
                    ${item.description}
                </div>
                
                <div class="detail-actions">
                    ${actionBtnHTML}
                    <button class="btn-secondary" onclick="closeModal(contentModal)"><i class="fa-solid fa-arrow-left"></i> Back to Gallery</button>
                </div>
            </div>
        </div>
    `;

    openModal(contentModal);
}

function openModal(targetModal) {
    targetModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(targetModal) {
    targetModal.classList.remove('active');
    if (targetModal === contentModal) {
        setTimeout(() => {
            modalBody.innerHTML = ''; // Clean up after transition
        }, 300);
    }

    // Only restore styling if all modals are closed
    if (!document.querySelectorAll('.modal-overlay.active').length) {
        document.body.style.overflow = '';
    }
}

// Custom Dialog System
async function showDialog({ title, message, showCancel = false }) {
    return new Promise((resolve) => {
        if (!dialogModal || !dialogTitle || !dialogMessage || !dialogFooter) {
            console.error('Dialog elements not found');
            resolve(false);
            return;
        }

        dialogTitle.textContent = title;
        dialogMessage.textContent = message;

        dialogFooter.innerHTML = '';

        if (showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => {
                closeModal(dialogModal);
                resolve(false);
            };
            dialogFooter.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-primary';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.onclick = () => {
            closeModal(dialogModal);
            resolve(true);
        };
        dialogFooter.appendChild(confirmBtn);

        openModal(dialogModal);
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
