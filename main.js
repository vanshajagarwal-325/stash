let categories = [
    { id: 'restaurants', name: 'Restaurants', icon: 'fa-utensils' },
    { id: 'concerts', name: 'Concerts', icon: 'fa-music' },
    { id: 'shows', name: 'Shows', icon: 'fa-masks-theater' }
];

// Dummy Data
const savedContent = [
    {
        id: 1,
        source: 'instagram',
        type: 'reel',
        category: 'restaurants',
        title: 'Hidden Gem in Downtown: Best Pasta in the City 🍝✨',
        url: 'https://instagram.com/p/12345',
        thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800',
        author: '@foodie_adventures',
        description: 'You have to try this place! The truffle pasta was out of this world. Definitely worth the 2 hour wait. Make sure to book in advance!',
        date: '2023-10-15',
        tags: ['food', 'pasta', 'downtown', 'italian']
    },
    {
        id: 2,
        source: 'youtube',
        type: 'video',
        category: 'tech',
        title: 'The Future of AI: What You Need to Know in 2024',
        url: 'https://youtube.com/watch?v=abcdef',
        thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
        author: 'TechExplained',
        description: 'In this video, we break down the latest advancements in artificial intelligence, from LLMs to robotics, and how they will shape our future over the next decade. Timestamps available below.',
        date: '2023-11-02',
        duration: '15:42',
        tags: ['ai', 'future', 'technology', 'innovation']
    },
    {
        id: 3,
        source: 'event',
        type: 'concert',
        category: 'concerts',
        title: 'Coldplay: Music of the Spheres World Tour',
        url: 'https://bookmyshow.com/events/coldplay',
        thumbnail: 'https://images.unsplash.com/photo-1540039155732-61ee14b12656?auto=format&fit=crop&q=80&w=800',
        author: 'BookMyShow',
        description: 'Experience Coldplay live at the National Stadium. A spectacular show featuring all their greatest hits plus new tracks from Music of the Spheres. Gates open at 5 PM.',
        date: '2024-05-20',
        location: 'National Stadium',
        tags: ['music', 'live', 'band', 'stadium']
    },
    {
        id: 4,
        source: 'article',
        type: 'blog',
        category: 'productivity',
        title: 'How to build mental models for better decision making',
        url: 'https://medium.com/mental-models',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
        author: 'Sarah Jenkins',
        description: 'Mental models are how we understand the world. Not only do they shape what we think and how we understand but they shape the connections and opportunities that we see. Find out how to build yours.',
        date: '2023-09-28',
        readTime: '8 min read',
        tags: ['psychology', 'growth', 'learning', 'self-improvement']
    },
    {
        id: 5,
        source: 'instagram',
        type: 'post',
        category: 'travel',
        title: '10 Spots You Cannot Miss in Kyoto 🎌⛩️',
        url: 'https://instagram.com/p/67890',
        thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
        author: '@wanderlust_jen',
        description: 'My complete itinerary for 3 days in Kyoto. Don\'t skip number 4, it was the highlight of our entire Japan trip! Save this post for your future travels.',
        date: '2023-12-05',
        tags: ['japan', 'travel', 'kyoto', 'bucketlist']
    },
    {
        id: 6,
        source: 'event',
        type: 'show',
        category: 'shows',
        title: 'Hamilton: The Musical',
        url: 'https://bookmyshow.com/events/hamilton',
        thumbnail: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?auto=format&fit=crop&q=80&w=800',
        author: 'BookMyShow',
        description: 'The story of America then, told by America now. Don\'t miss the multi-award-winning masterpiece by Lin-Manuel Miranda on its first international tour.',
        date: '2024-03-15',
        location: 'Grand Theater',
        tags: ['theatre', 'musical', 'broadway', 'history']
    },
    {
        id: 7,
        source: 'youtube',
        type: 'video',
        category: 'fitness',
        title: '15 Minute Core Workout (No Equipment)',
        url: 'https://youtube.com/watch?v=xyz123',
        thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
        author: 'FitnessBlender',
        description: 'A quick and intense core burning workout that you can do anywhere. No equipment needed. Perfect for beginners and advanced levels.',
        date: '2024-01-10',
        duration: '16:05',
        tags: ['workout', 'health', 'fitness', 'home-gym']
    },
    {
        id: 8,
        source: 'article',
        type: 'news',
        category: 'finance',
        title: 'Understanding the New Tax Code Changes for 2024',
        url: 'https://wsj.com/finance/taxes-2024',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        author: 'John Doe',
        description: 'A comprehensive breakdown of everything individuals and small business owners need to know about the upcoming tax season and how to prepare.',
        date: '2024-02-01',
        readTime: '12 min read',
        tags: ['money', 'taxes', 'business', 'economy']
    }
];

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
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
        month: months[date.getMonth()],
        day: date.getDate(),
        year: date.getFullYear(),
        full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
};

// Initialize App
function init() {
    renderCategories();
    renderQuickFilters();
    populateCategoryDropdown();
    renderGallery(savedContent);
    addEventListeners();
    updateBadgeCount();
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
        document.querySelector('.nav-item[data-filter="all"]').click();
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

    // Modal Close
    modalCloseBtn.addEventListener('click', () => closeModal(contentModal));
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
function handleAddContent(e) {
    e.preventDefault();

    const submittedData = {
        title: document.getElementById('itemTitle').value,
        url: document.getElementById('itemUrl').value,
        source: document.getElementById('itemSource').value,
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDescription').value,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // generic placeholder
        date: new Date().toISOString().split('T')[0],
        author: 'User',
        tags: []
    };

    if (editingItemId) {
        // Update existing
        const index = savedContent.findIndex(item => item.id == editingItemId);
        if (index !== -1) {
            // retain certain things like date and original thumbnail
            submittedData.thumbnail = savedContent[index].thumbnail;
            savedContent[index] = { ...savedContent[index], ...submittedData };
        }
    } else {
        // Create new
        submittedData.id = Date.now();
        savedContent.unshift(submittedData);
    }

    closeModal(addContentModal);
    filterContent();
    updateBadgeCount();
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
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const index = savedContent.findIndex(item => item.id == id);
        if (index !== -1) {
            savedContent.splice(index, 1);
            filterContent();
            updateBadgeCount();
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
        const dateInfo = formatDate(item.date);

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
