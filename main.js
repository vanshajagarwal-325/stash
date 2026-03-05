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
        subcategories: ['Toys', 'Clothes', 'Gear', 'Health', 'Baby Food']
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

// Helper to check if a category is event-related
function isEventCategory(categoryName) {
    if (!categoryName) return false;
    const lower = categoryName.toLowerCase();
    return lower.includes('event') || lower.includes('concert') || lower.includes('show');
}

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

/**
 * Deterministically generates an elegant linear gradient based on a string seed.
 */
function generateOmbre(seedStr) {
    const hash = (str) => {
        let h = 0x811c9dc5; // FNV-1a start
        for (let i = 0; i < (str || '').length; i++) {
            h ^= (str.charCodeAt(i) & 0xFF);
            h = Math.imul(h, 0x01000193); // Multiply by FNV prime
        }
        return h >>> 0;
    };

    const h = hash(seedStr || 'default');

    // Palettes: Soft, elegant hues
    const palettes = [
        { h1: 210, h2: 240 }, // Blues
        { h1: 280, h2: 320 }, // Purples
        { h1: 160, h2: 190 }, // Teals
        { h1: 340, h2: 10 },  // Pinks/Red
        { h1: 30, h2: 50 },   // Oranges/Gold
        { h1: 210, h2: 160 }  // Blue-Green
    ];

    const palette = palettes[h % palettes.length];

    // Sub-randomize for extreme uniqueness
    const hue1 = (palette.h1 + (h % 50) - 25) % 360;
    const hue2 = (palette.h2 + ((h >> 4) % 50) - 25) % 360;

    const sat = 45 + ((h >> 8) % 25); // 45-70%
    const lit1 = 30 + ((h >> 12) % 15); // 30-45%
    const lit2 = 15 + ((h >> 16) % 15); // 15-30%

    return `linear-gradient(135deg, hsl(${hue1}, ${sat}%, ${lit1}%), hsl(${hue2}, ${sat}%, ${lit2}%))`;
}




// Initialize App
async function init() {
    cacheElements();

    // Event Listeners (setup once) - Attach early to prevent native form submissions
    addEventListeners();
    setupAutoSuggest();
    initTheme();

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
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await handleAuthStateChange(session.user);
            } else if (event === 'SIGNED_OUT') {
                showAuth();
            }
        });
    }

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

let isAuthInitializing = false;
async function handleAuthStateChange(user) {
    if (!user || isAuthInitializing) return;
    isAuthInitializing = true;

    try {
        currentUser = user;
        authOverlay.style.display = 'none';
        appContainer.style.display = 'flex';

        // Load user-specific categories (Cloud sync)
        await loadCategories();

        // Refresh all UI components with new category data
        renderCategories();
        renderQuickFilters();

        // Update profile info
        const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
        if (userFirstName) userFirstName.textContent = firstName;
        if (userEmailDisp) userEmailDisp.textContent = user.email;

        await fetchSavedContent();
    } finally {
        isAuthInitializing = false;
    }
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
    // 1. Search functionality
    searchInput?.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        filterContent();
    });

    // 2. Global Event Delegation for Navigation (Sidebar and Filter Pills)
    document.addEventListener('click', (e) => {
        // Handle Sidebar Items and Category Pills
        const navItem = e.target.closest('.nav-item, .pill');
        if (navItem) {
            e.preventDefault();
            const clickedFilter = navItem.getAttribute('data-filter');
            if (clickedFilter) {
                // Toggle logic: If re-clicking active filter (and not 'all'), reset to 'all'
                if (currentFilter === clickedFilter && clickedFilter !== 'all') {
                    currentFilter = 'all';
                } else {
                    currentFilter = clickedFilter;
                }

                // Update UI active state (Sidebar and Pills)
                document.querySelectorAll('.nav-item, .pill').forEach(el => {
                    const elFilter = el.getAttribute('data-filter');
                    el.classList.toggle('active', elFilter === currentFilter);

                    // Sidebar subcategory visibility logic
                    if (el.classList.contains('nav-item')) {
                        const subList = el.closest('.nav-category-container')?.querySelector('.subcategory-list');
                        if (subList) {
                            subList.classList.toggle('active', elFilter === currentFilter);
                        }
                    }
                });

                filterContent();

                // Update page title
                if (currentFilter === 'all') {
                    if (pageTitle) pageTitle.textContent = 'All Items';
                } else {
                    const activeSidebarItem = document.querySelector(`.nav-item[data-filter="${currentFilter}"] span`);
                    if (pageTitle && activeSidebarItem) {
                        pageTitle.textContent = activeSidebarItem.textContent;
                    } else if (pageTitle) {
                        pageTitle.textContent = navItem.querySelector('span')?.textContent || navItem.textContent;
                    }
                }

                // Mobile: Close sidebar after selection
                if (window.innerWidth <= 1024 && navItem.classList.contains('nav-item')) {
                    sidebar?.classList.remove('active');
                    sidebarBackdrop?.classList.remove('active');
                }
            }
            return;
        }

        // Handle Gallery Card Actions (Edit, Delete, Share)
        const actionBtn = e.target.closest('.action-btn');
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = actionBtn.getAttribute('data-id');
            if (actionBtn.classList.contains('delete-btn')) {
                deleteItem(id);
            } else if (actionBtn.classList.contains('edit-btn')) {
                editItem(id);
            } else if (actionBtn.classList.contains('share-btn')) {
                showDialog({ title: 'Share', message: 'Sharing feature coming soon!' });
            }
            return;
        }

        // Handle Gallery Card Detail View
        const card = e.target.closest('.card');
        if (card) {
            const id = card.getAttribute('data-id');
            const item = savedContent.find(it => it.id === id);
            if (item) openContentModal(item);
            return;
        }
    });

    // 3. Device handoff/sync: Refresh content when user returns to the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && currentUser && !isAuthInitializing) {
            fetchSavedContent();
        }
    });

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

    // Logo Click Reset
    document.querySelector('.logo')?.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'all';
        currentSearchTerm = '';
        if (searchInput) searchInput.value = '';

        // Sync UI
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        const allPill = document.querySelector('.pill[data-filter="all"]');
        if (allPill) allPill.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(s => s.classList.remove('active'));
        const allItemsSidebar = document.querySelector('.nav-item[data-filter="all"]');
        if (allItemsSidebar) allItemsSidebar.classList.add('active');

        if (pageTitle) pageTitle.textContent = 'All Items';

        filterContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (subCategoryRow) subCategoryRow.style.display = 'none';
        document.getElementById('otherCategoryInput').style.display = 'none';
        document.getElementById('otherSubCategoryInput').style.display = 'none';
        renderCategoryPills();
        openModal(addContentModal);
    });

    // Form Submissions via Global Event Delegation
    document.addEventListener('submit', (e) => {
        if (e.target && e.target.id === 'addContentForm') {
            handleAddContent(e);
        } else if (e.target && e.target.id === 'addCategoryForm') {
            handleAddCategory(e);
        }
    });

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


// Logic to detect content type and suggest category
function setupAutoSuggest() {
    const itemUrl = document.getElementById('itemUrl');
    const itemTitle = document.getElementById('itemTitle');
    const itemSource = document.getElementById('itemSource');
    const itemDescription = document.getElementById('itemDescription');
    const itemCategory = document.getElementById('itemCategory');
    const itemSubCategory = document.getElementById('itemSubCategory');

    const updateThumbs = () => {
        // Automatically identify source for hidden field (internal only)
        const url = itemUrl?.value?.toLowerCase()?.trim();
        if (url) {
            let detectedSource = 'article';
            if (url.includes('instagram.com')) detectedSource = 'instagram';
            else if (url.includes('youtube.com') || url.includes('youtu.be')) detectedSource = 'youtube';
            if (itemSource) itemSource.value = detectedSource;
        }
    };

    // Trigger update on any relevant field change
    itemUrl?.addEventListener('blur', updateThumbs);
}

function handleCategoryChange(categoryName) {
    if (!categoryName) return;

    // Toggle Event Dates (Event is now a category)
    const isEvent = isEventCategory(categoryName);

    if (eventDateField) {
        eventDateField.style.display = isEvent ? 'block' : 'none';
    }

    updateSubcategoryPills(categoryName);
    // Update thumbnails when category changes
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

                };
            } else {
                otherSubInput.style.display = 'none';
                hiddenSubInput.value = pill.dataset.value;

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
        const isEvent = isEventCategory(categoryName);
        if (eventDateField) eventDateField.style.display = isEvent ? 'block' : 'none';
    } else {
        if (eventDateField) eventDateField.style.display = 'none';
    }

    // Update subcategory pills
    updateSubcategoryPills(categoryName);

}

function getEffectiveCategorySelection() {
    const hidden = document.getElementById('itemCategory')?.value?.trim() || '';
    if (hidden) return hidden;
    return document.querySelector('#categoryPillsContainer .cat-pill.active')?.dataset?.value || '';
}

function getEffectiveSubcategorySelection() {
    const hidden = document.getElementById('itemSubCategory')?.value?.trim() || '';
    if (hidden) return hidden;
    const active = document.querySelector('#subCategoryPillsContainer .sub-pill.active')?.dataset?.value || '';
    if (!active || active === '__others__') return '';
    return active;
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
}

function renderQuickFilters() {
    const quickFiltersContainer = document.getElementById('quickFilters');

    quickFiltersContainer.innerHTML = `
        <button class="pill active" data-filter="all">All</button>
        ${categories.map(cat => `<button class="pill" data-filter="${cat.id}">${cat.name}</button>`).join('')}
    `;
}

function populateCategoryDropdown() {
    const select = document.getElementById('itemCategory');
    select.innerHTML = categories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

// Handle Adding/Editing Content
async function handleAddContent(e) {
    if (e) e.preventDefault();
    if (!supabaseClient || !currentUser) {
        showDialog({ title: 'Error', message: 'User session not ready. Please wait a moment or try logging in again.' });
        console.error('Save failed: Supabase client or current user not initialized');
        return;
    }

    const catValue = document.getElementById('itemCategory')?.value?.trim() || "";
    if (!catValue) {
        await showDialog({ title: 'Category Required', message: 'Please select or enter a category for this item.' });
        return;
    }

    const submitBtn = document.querySelector('#addContentForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = editingItemId ? 'Updating...' : 'Saving...';
    }

    try {
        const submittedData = {
            title: document.getElementById('itemTitle').value,
            url: document.getElementById('itemUrl').value,
            source: document.getElementById('itemSource').value,
            category: catValue,
            subcategory: document.getElementById('itemSubCategory')?.value || null,
            description: document.getElementById('itemDescription').value,
            event_date: document.getElementById('itemEventDate').value || null,
            event_end_date: document.getElementById('itemEventEndDate')?.value || null,
            user_id: currentUser.id
        };

        const isEvent = isEventCategory(submittedData.category);
        if (isEvent && (!submittedData.event_date || !submittedData.event_end_date)) {
            await showDialog({ title: 'Missing Information', message: 'Start Date and End Date are mandatory for Events.' });
            return;
        }

        const dbPayload = {
            title: submittedData.title,
            url: submittedData.url,
            source: submittedData.source,
            category: submittedData.category,
            subcategory: submittedData.subcategory,
            description: submittedData.description,
            user_id: submittedData.user_id
        };

        if (isEvent) {
            dbPayload.event_date = submittedData.event_date;
            dbPayload.event_end_date = submittedData.event_end_date;
        }


        if (editingItemId) {
            const { error } = await supabaseClient
                .from('saved_content')
                .update(dbPayload)
                .eq('id', editingItemId)
                .eq('user_id', currentUser.id);

            if (error) throw error;
        } else {
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
        document.querySelectorAll('.nav-item').forEach(s => s.classList.remove('active'));
        const allItemsSidebar = document.querySelector('.nav-item[data-filter="all"]');
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

        // RESET editing state and form
        editingItemId = null;
        if (addContentForm) addContentForm.reset();

        // Ensure "Add New Item" title is restored
        const modalTitle = document.querySelector('#addContentModal h2');
        if (modalTitle) modalTitle.textContent = 'Save New Item';
    } catch (error) {
        console.error('Save error:', error);
        // Ensure modal closes and overflow resets even on error
        closeModal(addContentModal);
        document.body.style.overflow = '';
        await showDialog({ title: 'Error Saving Content', message: error.message });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Item';
        }
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
    if (e) e.preventDefault();
    if (!supabaseClient || !currentUser) return;

    const newName = document.getElementById('categoryName').value.trim();
    if (!newName) return;

    const submitBtn = document.querySelector('#addCategoryForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    try {
        const iconInput = document.getElementById('categoryIcon');
        const icon = iconInput ? iconInput.value : getCategoryIcon(newName);

        const exists = categories.some(cat => cat.name.toLowerCase() === newName.toLowerCase());
        if (exists) {
            await showDialog({ title: 'Duplicate Category', message: 'This category already exists.' });
            return;
        }

        const newCategory = { id: newName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: newName, icon: icon, subcategories: [] };
        categories.push(newCategory);
        await saveCategories();

        renderCategories();
        renderQuickFilters();
        closeModal(addCategoryModal);
        if (addCategoryForm) addCategoryForm.reset();
    } catch (error) {
        console.error("Error creating category:", error);
        await showDialog({ title: 'Error', message: 'Failed to save category.' });
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Category';
        }
    }
}

// Logic to delete an item
async function deleteItem(id) {
    if (!supabaseClient || !currentUser) {
        showDialog({ title: 'Error', message: 'User session not ready. Please wait or reload.' });
        return;
    }

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
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', item.id);

        // Background ombre based on Category x Subcategory for consistency
        card.style.background = generateOmbre(item.category + (item.subcategory || ''));

        const isEventCategoryItem = isEventCategory(item.category);
        const cardDateInfo = (isEventCategoryItem && item.event_date) ? formatDate(item.event_date) : null;

        let dateMarkup = '';
        if (isEventCategoryItem && item.event_date) {
            const endDateInfo = item.event_end_date ? formatDate(item.event_end_date) : null;
            dateMarkup = `<div class="card-date">${cardDateInfo.full}${endDateInfo ? ' — ' + endDateInfo.full : ''}</div>`;
        }

        card.innerHTML = `
            <div class="card-actions">
                <button class="action-btn share-btn" title="Share" data-id="${item.id}"><i class="fa-regular fa-share-from-square"></i></button>
                <button class="action-btn edit-btn" title="Edit" data-id="${item.id}"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="action-btn delete-btn" title="Delete" data-id="${item.id}" style="color: #ff8a8a;"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            <div class="card-overlay-content">
                <span class="card-category-tag">${item.category}${item.subcategory ? ' • ' + item.subcategory : ''}</span>
                <h3 class="card-title">${item.title}</h3>
                ${dateMarkup}
            </div>
            <div class="card-source-icon">
                <i class="${sourceIcons[item.source] || 'fa-solid fa-globe'}"></i>
            </div>
        `;

        galleryGrid.appendChild(card);
    });
}
// Modal Functions
function openContentModal(item) {
    const isEventCategoryItem = isEventCategory(item.category);

    // For events, use the event_date, otherwise use creation date
    const dateValue = (isEventCategoryItem && item.event_date) ? item.event_date : (item.date || item.created_at);
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

    if (isEventCategoryItem && item.event_date) {
        const endDateInfo = item.event_end_date ? formatDate(item.event_end_date) : null;
        metaHTML += `
            <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Location'}</span>
            <span><i class="fa-regular fa-calendar-check"></i> ${dateInfo.full}${endDateInfo ? ' - ' + endDateInfo.full : ''}</span>
        `;
    }

    modalBody.innerHTML = `
        <div class="detail-view">
            <div class="detail-media" style="background: ${generateOmbre(item.category + (item.subcategory || ''))}; padding: 60px 40px; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-radius: 20px 20px 0 0;">
                <div style="position: absolute; top: 32px; left: 32px; color: rgba(255,255,255,0.7); font-size: 1.5rem;">
                    <i class="${sourceIcons[item.source] || 'fa-solid fa-globe'}"></i>
                </div>
                <span style="font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">${item.category}${item.subcategory ? ' • ' + item.subcategory : ''}</span>
                <h2 style="color: white; font-size: 1.8rem; font-weight: 700; text-align: center; margin: 0; text-shadow: 0 4px 12px rgba(0,0,0,0.3); line-height: 1.2;">${item.title}</h2>
                ${(isEventCategoryItem && item.event_date) ? `
                    <div style="margin-top: 16px; font-weight: 500; color: white; background: rgba(0,0,0,0.2); padding: 4px 16px; border-radius: 20px; font-size: 0.9rem;">
                        <i class="fa-regular fa-calendar-check"></i> ${dateInfo.full}${item.event_end_date ? ' — ' + formatDate(item.event_end_date).full : ''}
                    </div>
                ` : ''}
            </div>
            <div class="detail-content">
                <div class="detail-source-badge ${item.source}">
                    <i class="${sourceIcons[item.source]}"></i>
                    <span>${item.source.charAt(0).toUpperCase() + item.source.slice(1)}</span>
                </div>
                <div class="detail-meta" style="margin-top: 24px;">
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

        const cleanupAndResolve = (result) => {
            closeModal(dialogModal);
            if (closeDialog) closeDialog.onclick = null;
            document.removeEventListener('keydown', escapeHandler);
            resolve(result);
        };

        const escapeHandler = (e) => {
            if (e.key === 'Escape' && dialogModal.classList.contains('active')) {
                cleanupAndResolve(false);
            }
        };

        if (closeDialog) {
            closeDialog.onclick = () => cleanupAndResolve(false);
        }

        document.addEventListener('keydown', escapeHandler);

        if (showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => cleanupAndResolve(false);
            dialogFooter.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-primary';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.onclick = () => cleanupAndResolve(true);
        dialogFooter.appendChild(confirmBtn);

        openModal(dialogModal);
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
