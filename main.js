// Supabase Configuration
const SUPABASE_URL = 'https://gsgoljfhmlqcfanxcgds.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-Do1oSuxsCvpfaB564V0eQ_Ern8LOtm';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let categories = [
    { id: 'restaurants', name: 'Restaurants', icon: 'fa-utensils' },
    { id: 'concerts', name: 'Concerts', icon: 'fa-music' },
    { id: 'shows', name: 'Shows', icon: 'fa-masks-theater' }
];

let currentUser = null;
let savedContent = []; // Will be populated from Supabase
// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
let sidebarItems = document.querySelectorAll('.nav-item');
let quickFilters = document.querySelectorAll('.pill');
const pageTitle = document.getElementById('pageTitle');
const clearFiltersBtn = document.querySelector('.clear-filters-btn');

// Add specific elements
const addBtn = document.querySelector('.add-btn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesNavMenu = addCategoryBtn.parentElement; // Used to insert new categories before action item
const notificationIcon = document.querySelector('.notification-icon');
const profileAvatar = document.querySelector('.avatar');

// Modals
const contentModal = document.getElementById('contentModal');
const addContentModal = document.getElementById('addContentModal');
const addCategoryModal = document.getElementById('addCategoryModal');

// Auth Elements
const authOverlay = document.getElementById('authOverlay');
const appContainer = document.getElementById('appContainer');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const signOutBtn = document.getElementById('signOutBtn');
const instagramLoginBtn = document.getElementById('instagramLoginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');

let authMode = 'login';

// Mobile Menu Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

// Modal Elements
const modalCloseBtn = contentModal.querySelector('.modal-close');
const modalBody = document.getElementById('modalBody');

// Form elements
const addContentForm = document.getElementById('addContentForm');
const addCategoryForm = document.getElementById('addCategoryForm');
const addContentClose = document.getElementById('addContentClose');
const addCategoryClose = document.getElementById('addCategoryClose');
const addContentCancel = document.getElementById('addContentCancel');
const addCategoryCancel = document.getElementById('addCategoryCancel');
const categoryIcons = document.querySelectorAll('.icon-btn');
const categoryIconInput = document.getElementById('categoryIcon');

// Edit tracking state
let editingItemId = null;

// State
let currentFilter = 'all';
let currentSearchTerm = '';

// Icons mapping for sources
const sourceIcons = {
    instagram: 'fa-brands fa-instagram',
    youtube: 'fa-brands fa-youtube',
    article: 'fa-regular fa-newspaper',
    event: 'fa-solid fa-ticket'
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

// Initialize App
async function init() {
    // Check for existing session
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            handleAuthStateChange(session.user);
        } else {
            showAuth();
        }

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            if (session) {
                handleAuthStateChange(session.user);
            } else {
                showAuth();
            }
        });
    }

    renderCategories();
    renderQuickFilters();
    populateCategoryDropdown();
    addEventListeners();
}

function showAuth() {
    authOverlay.style.display = 'flex';
    appContainer.style.display = 'none';
}

async function handleAuthStateChange(user) {
    currentUser = user;
    authOverlay.style.display = 'none';
    appContainer.style.display = 'flex';

    // Update profile avatar if available
    if (user.user_metadata?.avatar_url) {
        const avatarImg = document.getElementById('profileAvatar');
        if (avatarImg) avatarImg.src = user.user_metadata.avatar_url;
    }

    await fetchSavedContent();
    updateBadgeCount();
}

async function fetchSavedContent() {
    if (!supabaseClient || !currentUser) return;

    const { data, error } = await supabaseClient
        .from('saved_content')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching content:', error);
        return;
    }

    savedContent = data || [];
    renderGallery(savedContent);
}

// Event Listeners
function addEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase();
        filterContent();
    });

    addNavigationEventListeners();

    // Clear filters button in empty state
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchTerm = '';

        // Trigger click on 'All' sidebar item
        const allFilter = document.querySelector('.nav-item[data-filter="all"]');
        if (allFilter) allFilter.click();
    });

    // Top Header Items Listeners
    const notificationBtn = document.querySelector('.notification-icon');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert('You have no new notifications at this time.');
        });
    }

    const avatarBtn = document.querySelector('.avatar');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', () => {
            alert('Profile settings feature is coming soon!');
        });
    }

    // Auth Event Listeners
    loginTab?.addEventListener('click', () => {
        authMode = 'login';
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        authSubmitBtn.textContent = 'Login';
    });

    signupTab?.addEventListener('click', () => {
        authMode = 'signup';
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        authSubmitBtn.textContent = 'Sign Up';
    });

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmail.value;
        const password = authPassword.value;

        if (!supabaseClient) {
            alert('Supabase not configured yet. Please provide your keys!');
            return;
        }

        try {
            if (authMode === 'login') {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                alert('Success! Check your email for a confirmation link.');
            }
        } catch (error) {
            alert(error.message);
        }
    });

    signOutBtn?.addEventListener('click', async () => {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
    });

    instagramLoginBtn?.addEventListener('click', async () => {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'instagram',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) alert(error.message);
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
    modalCloseBtn?.addEventListener('click', () => closeModal(contentModal));
    contentModal.addEventListener('click', (e) => {
        if (e.target === contentModal) closeModal(contentModal);
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(contentModal);
            closeModal(addContentModal);
            closeModal(addCategoryModal);
        }
    });

    // Add Content Modal Listeners
    addBtn.addEventListener('click', () => {
        editingItemId = null;
        document.querySelector('#addContentModal h2').textContent = 'Save New Item';
        addContentForm.reset();
        openModal(addContentModal);
    });
    addContentClose.addEventListener('click', () => closeModal(addContentModal));
    addContentCancel.addEventListener('click', () => closeModal(addContentModal));
    addContentModal.addEventListener('click', (e) => {
        if (e.target === addContentModal) closeModal(addContentModal);
    });

    // Form Submissions
    addContentForm.addEventListener('submit', handleAddContent);
    addCategoryForm.addEventListener('submit', handleAddCategory);

    // Add Category Modal Listeners
    addCategoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addCategoryForm.reset();

        // Reset icon picker
        categoryIcons.forEach(i => i.classList.remove('active'));
        categoryIcons[0].classList.add('active');
        categoryIconInput.value = 'fa-folder';

        openModal(addCategoryModal);
    });
    addCategoryClose.addEventListener('click', () => closeModal(addCategoryModal));
    addCategoryCancel.addEventListener('click', () => closeModal(addCategoryModal));
    addCategoryModal.addEventListener('click', (e) => {
        if (e.target === addCategoryModal) closeModal(addCategoryModal);
    });

    // Icon Picker Logic
    categoryIcons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryIcons.forEach(i => i.classList.remove('active'));
            btn.classList.add('active');
            categoryIconInput.value = btn.getAttribute('data-icon');
        });
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
            sidebar.classList.remove('active');
            sidebarBackdrop.classList.remove('active');
        });
    }

    const mobileFab = document.getElementById('mobileFab');
    if (mobileFab) {
        mobileFab.addEventListener('click', () => {
            editingItemId = null;
            document.querySelector('#addContentModal h2').textContent = 'Save New Item';
            addContentForm.reset();
            openModal(addContentModal);
        });
    }
}

function addNavigationEventListeners() {
    // Refetch in case they were updated
    sidebarItems = document.querySelectorAll('.nav-item');
    quickFilters = document.querySelectorAll('.pill');

    // Sidebar navigation filters
    sidebarItems.forEach(item => {
        // Remove existing to prevent duplicates when refetching
        const new_item = item.cloneNode(true);
        item.parentNode.replaceChild(new_item, item);

        new_item.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state
            sidebarItems.forEach(i => i.classList.remove('active'));
            new_item.classList.add('active');

            // Get filter value and update title
            currentFilter = new_item.getAttribute('data-filter');
            pageTitle.textContent = new_item.querySelector('span').textContent;

            // Reset quick filters unless it matches
            quickFilters.forEach(pill => {
                pill.classList.remove('active');
                if (pill.getAttribute('data-filter') === currentFilter ||
                    (currentFilter === 'all' && pill.getAttribute('data-filter') === 'all')) {
                    pill.classList.add('active');
                }
            });

            filterContent();

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
                sidebarBackdrop.classList.remove('active');
            }
        });
    });

    // Quick pills filters
    quickFilters.forEach(pill => {
        // Remove existing
        const new_pill = pill.cloneNode(true);
        pill.parentNode.replaceChild(new_pill, pill);

        new_pill.addEventListener('click', () => {
            // Update active state
            quickFilters.forEach(p => p.classList.remove('active'));
            new_pill.classList.add('active');

            currentFilter = new_pill.getAttribute('data-filter');

            // Try to sync sidebar if applicable
            sidebarItems.forEach(item => {
                if (item.getAttribute('data-filter') === currentFilter) {
                    sidebarItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    pageTitle.textContent = item.querySelector('span').textContent;
                } else if (currentFilter === 'all' && item.getAttribute('data-filter') === 'all') {
                    sidebarItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    pageTitle.textContent = 'All Items';
                }
            });

            // Update title if not synched in loop above
            if (!Array.from(sidebarItems).some(item => item.getAttribute('data-filter') === currentFilter)) {
                sidebarItems.forEach(i => i.classList.remove('active'));
                pageTitle.textContent = new_pill.textContent;
            }

            filterContent();
        });
    });
}

// Logic to render categories dynamically
function renderCategories() {
    // Find where to insert categories (after "Categories" title)
    const categoryTitle = Array.from(document.querySelectorAll('.nav-section-title')).find(el => el.textContent === 'Categories');

    // Clear existing categories
    const itemsToRemove = [];
    let currentEl = categoryTitle.nextElementSibling;
    while (currentEl && currentEl.id !== 'addCategoryBtn') {
        itemsToRemove.push(currentEl);
        currentEl = currentEl.nextElementSibling;
    }
    itemsToRemove.forEach(el => el.remove());

    // Insert categories
    categories.reverse().forEach(cat => {
        const a = document.createElement('a');
        a.href = "#";
        a.className = "nav-item";
        a.setAttribute('data-filter', cat.id);
        a.innerHTML = `
            <i class="fa-solid ${cat.icon}"></i>
            <span>${cat.name}</span>
        `;
        categoryTitle.parentNode.insertBefore(a, categoryTitle.nextSibling);
    });
    categories.reverse(); // restore order

    // Reattach listeners
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
        description: document.getElementById('itemDescription').value,
        user_id: currentUser.id
    };

    try {
        if (editingItemId) {
            // Update existing
            const { error } = await supabaseClient
                .from('saved_content')
                .update(submittedData)
                .eq('id', editingItemId);

            if (error) throw error;
        } else {
            // Create new
            // For new items, add a generic thumbnail if none provided (mocking for now)
            submittedData.thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';

            const { error } = await supabaseClient
                .from('saved_content')
                .insert([submittedData]);

            if (error) throw error;
        }

        closeModal(addContentModal);
        await fetchSavedContent(); // Refresh gallery from Supabase
    } catch (error) {
        alert('Error saving content: ' + error.message);
    }
}

// Handle Adding Categories
function handleAddCategory(e) {
    e.preventDefault();

    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Add to state
    categories.push({ id, name, icon });

    // Rerender UI components that depend on categories
    renderCategories();
    renderQuickFilters();
    populateCategoryDropdown();

    closeModal(addCategoryModal);
}

// Logic to delete an item
async function deleteItem(id) {
    if (!supabaseClient) return;

    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const { error } = await supabaseClient
                .from('saved_content')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchSavedContent();
        } catch (error) {
            alert('Error deleting item: ' + error.message);
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
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemDescription').value = item.description || '';

    openModal(addContentModal);
}

// Filter logic combining search and category/source
function filterContent() {
    let filtered = savedContent;

    // Apply category/source filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(item =>
            item.source === currentFilter ||
            item.category === currentFilter
        );
    }

    // Apply search filter
    if (currentSearchTerm) {
        filtered = filtered.filter(item => {
            const searchableText = `
                ${item.title} 
                ${item.author} 
                ${item.description} 
                ${item.tags.join(' ')}
                ${item.category}
                ${item.source}
            `.toLowerCase();

            return searchableText.includes(currentSearchTerm);
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

        if (item.source === 'event') {
            specialMarkup = `
                <div class="event-date-badge">
                    <span class="event-month">${dateInfo.month}</span>
                    <span class="event-day">${dateInfo.day}</span>
                </div>
            `;
            metaMarkup = `<span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>`;
        } else if (item.source === 'youtube') {
            metaMarkup = `<span><i class="fa-regular fa-clock"></i> ${item.duration}</span>`;
        } else if (item.source === 'article') {
            metaMarkup = `<span><i class="fa-regular fa-clock"></i> ${item.readTime}</span>`;
        } else {
            metaMarkup = `<span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>`;
        }

        card.innerHTML = `
            <div class="card-media">
                <div class="card-overlay"></div>
                <div class="source-icon ${item.source}">
                    <i class="${sourceIcons[item.source]}"></i>
                </div>
                ${specialMarkup}
                <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
            </div>
            <div class="card-content">
                <span class="card-category">${item.category}</span>
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
        card.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) {
                const id = btn.getAttribute('data-id');
                if (btn.classList.contains('delete-btn')) {
                    deleteItem(id);
                } else if (btn.classList.contains('edit-btn')) {
                    editItem(id);
                } else if (btn.classList.contains('share-btn')) {
                    alert('Sharing feature coming soon!'); // Mock share
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
    const dateInfo = formatDate(item.date);
    let metaHTML = '';
    let actionBtnHTML = '';

    // Customize modal content based on source type
    if (item.source === 'youtube') {
        metaHTML = `
            <span><i class="fa-regular fa-user"></i> ${item.author}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
            <span><i class="fa-regular fa-clock"></i> ${item.duration}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-brands fa-youtube"></i> Watch on YouTube</a>`;
    } else if (item.source === 'instagram') {
        metaHTML = `
            <span><i class="fa-brands fa-instagram"></i> ${item.author}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-brands fa-instagram"></i> View Post</a>`;
    } else if (item.source === 'article') {
        metaHTML = `
            <span><i class="fa-regular fa-user"></i> ${item.author}</span>
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
            <span><i class="fa-regular fa-clock"></i> ${item.readTime}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-solid fa-book-open"></i> Read Full Article</a>`;
    } else if (item.source === 'event') {
        metaHTML = `
            <span><i class="fa-regular fa-calendar"></i> ${dateInfo.full}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
        `;
        actionBtnHTML = `<a href="${item.url}" target="_blank" class="btn-primary"><i class="fa-solid fa-ticket"></i> Book Tickets</a>`;
    }

    modalBody.innerHTML = `
        <div class="detail-view">
            <div class="detail-media">
                <img src="${item.thumbnail}" alt="${item.title}">
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

// Utility to update notification badge
function updateBadgeCount() {
    const badge = document.querySelector('.badge');
    badge.textContent = savedContent.length;
}

// Start app
document.addEventListener('DOMContentLoaded', init);
