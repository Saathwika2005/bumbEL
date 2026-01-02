/**
 * bumbEL Frontend Application
 * Integrated with Backend API
 */

// =====================================================
// API Service
// =====================================================
const API = {
    baseUrl: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        }
    },

    // Auth endpoints
    async checkAuth() {
        return this.request('/auth/me');
    },

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    },

    // Discover endpoints
    async getDiscover(limit = 20) {
        return this.request(`/discover?limit=${limit}`);
    },

    // Swipe endpoint
    async swipe(targetId, direction) {
        return this.request('/swipe', {
            method: 'POST',
            body: JSON.stringify({ targetId, direction })
        });
    },

    // Matches endpoints
    async getMatches() {
        return this.request('/matches');
    },

    async getMatchCount() {
        return this.request('/matches/count');
    },

    // Profile endpoints
    async getProfile() {
        return this.request('/profile');
    },

    async updateProfile(data) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
};

// =====================================================
// Application State
// =====================================================
let currentUser = null;
let isAuthenticated = false;
let profiles = [];
let currentProfileIndex = 0;
let matches = [];
let currentFilter = 'tech';
let currentChatUser = null;
let swipedIds = new Set();
let dragStartX = 0;
let dragStartY = 0;
let isDragging = false;
let userProfile = {
    name: "You",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "6th Sem",
    skills: [],
    lookingFor: "",
    bio: "",
    interests: []
};

// =====================================================
// Initialization
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('bumbEL initializing...');
    await checkAuthStatus();
    initializeApp();
    setupEventListeners();
    await loadDiscoverFeed();
    await loadMatches();
});

async function checkAuthStatus() {
    try {
        const data = await API.checkAuth();
        currentUser = data.user;
        isAuthenticated = true;
        console.log('✓ Authenticated as:', currentUser.name);
        showAuthenticatedUI();
    } catch (err) {
        console.log('Not authenticated, using offline mode');
        isAuthenticated = false;
        // Continue with offline/demo mode using static data
    }
}

function showAuthenticatedUI() {
    const profileBtn = document.querySelector('[data-view="profile"]');
    if (profileBtn && currentUser) {
        const icon = profileBtn.querySelector('.icon');
        if (icon) {
            icon.innerHTML = `<span style="font-size: 1.2rem;">${currentUser.avatar || '👤'}</span>`;
        }
    }

    const nav = document.querySelector('.nav');
    if (nav && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'nav-btn';
        logoutBtn.innerHTML = '<span class="icon"><i class="fas fa-sign-out-alt"></i></span><span>Logout</span>';
        logoutBtn.addEventListener('click', handleLogout);
        nav.appendChild(logoutBtn);
    }
}

async function handleLogout() {
    try {
        await API.logout();
        window.location.href = '/login';
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

function initializeApp() {
    // Load saved matches from localStorage (fallback)
    const savedMatches = localStorage.getItem('bumbELMatches');
    if (savedMatches && !isAuthenticated) {
        matches = JSON.parse(savedMatches);
        updateMatchCount();
        renderMatches();
    }

    // Load saved user profile from localStorage (fallback)
    const savedProfile = localStorage.getItem('bumbELUserProfile');
    if (savedProfile && !isAuthenticated) {
        userProfile = JSON.parse(savedProfile);
        updateProfileDisplay();
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Action Buttons
    document.getElementById('nopeBtn').addEventListener('click', () => handleSwipe('nope'));
    document.getElementById('likeBtn').addEventListener('click', () => handleSwipe('like'));
    document.getElementById('superBtn').addEventListener('click', () => handleSwipe('super'));

    // Filter Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', async (e) => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            currentProfileIndex = 0;
            await loadDiscoverFeed();
        });
    });

    // Match Notification
    document.getElementById('keepSwipingBtn').addEventListener('click', closeMatchNotification);
    document.getElementById('sendMessageBtn').addEventListener('click', () => {
        closeMatchNotification();
        openChat(matches[matches.length - 1]);
    });

    // Chat Modal
    document.getElementById('closeChat').addEventListener('click', closeChat);
    document.getElementById('backToMatches').addEventListener('click', closeChat);
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Edit Profile Modal
    document.querySelector('.edit-profile-btn').addEventListener('click', openEditProfile);
    document.getElementById('closeEditProfile').addEventListener('click', closeEditProfile);
    document.getElementById('cancelEditProfile').addEventListener('click', closeEditProfile);
    document.getElementById('editProfileForm').addEventListener('submit', saveProfile);
    document.getElementById('addSkillBtn').addEventListener('click', addSkill);
    document.getElementById('skillInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    // Profile Logout Button
    document.getElementById('profileLogoutBtn').addEventListener('click', handleLogout);
}

function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active-view');
    });

    if (viewName === 'discover') {
        document.getElementById('discoverView').classList.add('active-view');
    } else if (viewName === 'matches') {
        document.getElementById('matchesView').classList.add('active-view');
        if (isAuthenticated) loadMatches();
        renderMatches();
    } else if (viewName === 'profile') {
        document.getElementById('profileView').classList.add('active-view');
        if (isAuthenticated) loadProfileView();
    }
}

// =====================================================
// Load Discover Feed (API only)
// =====================================================
async function loadDiscoverFeed() {
    const cardStack = document.querySelector('.card-stack');
    if (!cardStack) return;

    if (!isAuthenticated) {
        cardStack.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <h3>Please Login</h3>
                <p style="color: var(--bumble-gray);">You need to be logged in to discover teammates!</p>
                <a href="/login" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--bumble-yellow); border: none; border-radius: 10px; cursor: pointer; font-weight: 600; text-decoration: none; color: black;">
                    Login
                </a>
            </div>
        `;
        return;
    }

    try {
        cardStack.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--bumble-gray);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                <p style="margin-top: 1rem;">Loading profiles...</p>
            </div>
        `;

        const data = await API.getDiscover();
        profiles = data.profiles || [];
        swipedIds.clear();
        currentProfileIndex = 0;
        console.log(`Loaded ${profiles.length} profiles from API`);
        filterAndDisplayProfiles();
    } catch (err) {
        console.error('Failed to load profiles:', err);
        cardStack.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Failed to load profiles</h3>
                <p style="color: var(--bumble-gray);">${err.message || 'Please try again later'}</p>
                <button onclick="loadDiscoverFeed()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--bumble-yellow); border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    Try Again
                </button>
            </div>
        `;
    }
}

async function loadMatches() {
    if (!isAuthenticated) return;
    try {
        const data = await API.getMatches();
        matches = data.matches?.map(m => m.user) || [];
        updateMatchCount();
        renderMatches();
    } catch (err) {
        console.error('Failed to load matches:', err);
    }
}

async function loadProfileView() {
    if (!isAuthenticated) return;
    try {
        const data = await API.getProfile();
        if (data.profile) {
            userProfile = data.profile;
            updateProfileDisplay();
        }
    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}

function filterAndDisplayProfiles() {
    const cardStack = document.querySelector('.card-stack');
    if (!cardStack) return;

    let filteredProfiles = profiles.filter(profile => {
        if (swipedIds.has(profile.id)) return false;
        if (profile.category?.toLowerCase() === currentFilter) return true;
        return profile.skills?.some(skill => skill.category?.toLowerCase() === currentFilter);
    });

    cardStack.innerHTML = '';

    if (filteredProfiles.length === 0) {
        cardStack.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3>No more profiles</h3>
                <p style="color: var(--bumble-gray);">Try a different category or check back later!</p>
                <button onclick="loadDiscoverFeed()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--bumble-yellow); border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                    Refresh Feed
                </button>
            </div>
        `;
        return;
    }

    const profile = filteredProfiles[0];
    createProfileCard(profile, 0);
}

function createProfileCard(profile, stackIndex) {
    console.log('Creating card for:', profile.name, 'at index:', stackIndex);
    const card = document.createElement('div');
    card.className = 'profile-card-item';
    card.dataset.profileId = profile.id;
    card.style.transform = `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.05})`;
    card.style.zIndex = 100 - stackIndex;

    const skillsHTML = (profile.skills || []).map(skill => 
        `<span class="skill-tag ${skill.category || 'tech'}">${skill.name}</span>`
    ).join('');

    card.innerHTML = `
        <div class="card-avatar"><span style="font-size: 4rem;">${profile.avatar || '👤'}</span></div>
        <div class="card-info">
            <h3 class="card-name">${profile.name}</h3>
            <div class="card-meta">
                <span class="meta-item"><i class="fas fa-book"></i> ${profile.branch}</span>
                <span class="meta-item"><i class="fas fa-graduation-cap"></i> ${profile.year}</span>
                <span class="meta-item"><i class="far fa-calendar"></i> ${profile.semester || ''}</span>
            </div>
        </div>
        <div class="card-section">
            <h4>Looking For</h4>
            <p class="card-bio" style="color: var(--bumble-yellow); font-weight: 600;">${profile.lookingFor || ''}</p>
        </div>
        <div class="card-section">
            <h4>About</h4>
            <p class="card-bio">${profile.bio || ''}</p>
        </div>
        ${skillsHTML ? `<div class="card-section"><h4>Skills</h4><div class="skills-list">${skillsHTML}</div></div>` : ''}
    `;

    // Add touch/mouse events for dragging
    if (stackIndex === 0) {
        setupCardDrag(card);
    }

    const cardStack = document.querySelector('.card-stack');
    cardStack.appendChild(card);
    console.log('Card appended, total cards now:', document.querySelectorAll('.profile-card-item').length);
}

function setupCardDrag(card) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const onStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        card.classList.add('dragging');
    };

    const onMove = (e) => {
        if (!isDragging) return;
        
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - startX;
        const rotation = deltaX / 20;
        
        card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        
        // Visual feedback
        if (deltaX > 50) {
            card.style.borderColor = 'var(--primary-yellow)';
        } else if (deltaX < -50) {
            card.style.borderColor = 'var(--primary-pink)';
        } else {
            card.style.borderColor = 'transparent';
        }
    };

    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('dragging');
        
        const deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > 100) {
            // Swipe complete
            const direction = deltaX > 0 ? 'like' : 'nope';
            animateCardSwipe(card, direction);
            handleSwipe(direction);
        } else {
            // Reset card
            card.style.transform = '';
            card.style.borderColor = 'transparent';
        }
        
        currentX = 0;
        startX = 0;
    };

    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
}

function animateCardSwipe(card, direction) {
    const translateX = direction === 'like' ? 1000 : -1000;
    card.style.transition = 'transform 0.5s ease-out, opacity 0.5s';
    card.style.transform = `translateX(${translateX}px) rotate(${direction === 'like' ? 30 : -30}deg)`;
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.remove();
    }, 500);
}

// Special animation for when it's a match!
function animateMatchCard(card) {
    // Card pulses and glows before flying away
    card.style.transition = 'all 0.3s ease-out';
    card.style.transform = 'scale(1.1)';
    card.style.boxShadow = '0 0 40px rgba(255, 198, 41, 0.8), 0 0 80px rgba(255, 107, 107, 0.6)';
    card.style.border = '3px solid #FFC629';
    
    // Add match glow overlay
    const glowOverlay = document.createElement('div');
    glowOverlay.className = 'match-glow-overlay';
    glowOverlay.innerHTML = '<span style="font-size: 4rem;">💛</span>';
    glowOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 198, 41, 0.3);
        border-radius: inherit;
        animation: pulse 0.5s ease-in-out;
    `;
    card.style.position = 'relative';
    card.appendChild(glowOverlay);
    
    // Then fly up and fade
    setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        card.style.transform = 'scale(0) rotate(720deg)';
        card.style.opacity = '0';
    }, 400);
    
    setTimeout(() => {
        card.remove();
    }, 1000);
}

function handleSwipe(action) {
    const cards = document.querySelectorAll('.profile-card-item');
    if (cards.length === 0) return;

    const topCard = cards[0];
    const profileId = parseInt(topCard.dataset.profileId);
    const profile = profiles.find(p => p.id === profileId);

    if (!profile) return;

    // Track swiped profile
    swipedIds.add(profileId);

    // Animate swipe
    if (action === 'like' || action === 'super' || action === 'right') {
        
        if (isAuthenticated) {
            // Send swipe to API first to check for match
            const direction = action === 'super' ? 'super' : 'right';
            API.swipe(profileId, direction).then(result => {
                if (result.matched) {
                    console.log('🎉 It\'s a match! Triggering celebration...');
                    // Use special match animation
                    animateMatchCard(topCard);
                    loadMatches();
                    // Show match notification with confetti after card animation
                    setTimeout(() => {
                        createMatch(profile);
                    }, 500);
                } else {
                    // Normal swipe animation
                    animateCardSwipe(topCard, 'like');
                }
            }).catch(err => {
                console.error('Swipe failed:', err);
                animateCardSwipe(topCard, 'like');
            });
        } else {
            // Offline mode - animate immediately
            animateCardSwipe(topCard, 'like');
            // Offline mode - random match
            const matchChance = action === 'super' ? 0.7 : 0.4;
            if (Math.random() < matchChance) {
                setTimeout(() => createMatch(profile), 600);
            }
        }
    } else {
        animateCardSwipe(topCard, 'nope');
        if (isAuthenticated) {
            API.swipe(profileId, 'left').catch(err => console.error('Swipe failed:', err));
        }
    }

    // Load next profile after animation
    setTimeout(() => {
        currentProfileIndex++;
        if (isAuthenticated) {
            filterAndDisplayProfiles();
        } else {
            loadProfiles();
        }
    }, 300);
}

function createMatch(profile) {
    console.log('createMatch called with profile:', profile?.name);
    // Check if already matched
    if (matches.some(m => m.id === profile.id)) {
        console.log('Already matched with this profile');
        return;
    }

    matches.push(profile);
    localStorage.setItem('bumbELMatches', JSON.stringify(matches));
    updateMatchCount();
    showMatchNotification(profile);
}

function showMatchNotification(profile) {
    console.log('showMatchNotification called, launching confetti...');
    const notification = document.getElementById('matchNotification');
    const matchedAvatar = notification.querySelector('.matched-avatar');
    const matchedName = document.getElementById('matchedName');
    
    matchedAvatar.innerHTML = `<span style="font-size: 4rem;">${profile.avatar || '👤'}</span>`;
    matchedName.textContent = profile.name;
    
    notification.classList.add('show');
    
    // 🎉 Confetti celebration!
    launchConfetti();
}

function launchConfetti() {
    // Check if confetti library is loaded
    if (typeof confetti !== 'function') {
        console.warn('Confetti library not loaded');
        return;
    }
    
    console.log('🎉 Launching confetti!');
    
    try {
        // Configure confetti to use high z-index
        const defaults = {
            zIndex: 9999,
            disableForReducedMotion: true
        };
        
        // First burst - left side
        confetti({
            ...defaults,
            particleCount: 100,
            spread: 70,
            origin: { x: 0.1, y: 0.6 },
            colors: ['#FFC629', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        });
        
        // Second burst - right side
        confetti({
            ...defaults,
            particleCount: 100,
            spread: 70,
            origin: { x: 0.9, y: 0.6 },
            colors: ['#FFC629', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        });
        
        // Center burst after a delay
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 150,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#FFC629', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
            });
        }, 250);
        
        // More confetti
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 50,
                spread: 60,
                origin: { x: 0.5, y: 0.3 },
                shapes: ['circle'],
                colors: ['#FF6B6B', '#FFC629']
            });
        }, 400);
    } catch (err) {
        console.error('Confetti error:', err);
    }
}

function closeMatchNotification() {
    document.getElementById('matchNotification').classList.remove('show');
}

function updateMatchCount() {
    document.getElementById('matchCount').textContent = matches.length;
}

function renderMatches() {
    const matchesGrid = document.getElementById('matchesGrid');
    
    if (matches.length === 0) {
        matchesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="far fa-circle-dot"></i></div>
                <h3>No matches yet!</h3>
                <p>Start swiping to find your perfect teammates</p>
            </div>
        `;
        return;
    }

    matchesGrid.innerHTML = matches.map((match, index) => {
        // Handle both API format (with user property) and local format
        const user = match.user || match;
        const skillsDisplay = (user.skills || []).slice(0, 2).map(s => s.name).join(', ');
        
        return `
            <div class="match-card" data-match-index="${index}">
                <button class="unmatch-btn" onclick="event.stopPropagation(); unmatchUser(${index});" title="Unmatch">
                    <i class="fas fa-times"></i>
                </button>
                <div onclick="openChat(${JSON.stringify(user).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                    <div class="match-avatar">
                        <span style="font-size: 2rem;">${user.avatar || '👤'}</span>
                        <div class="match-status"></div>
                    </div>
                    <h3 class="match-name">${user.name}</h3>
                    <p class="match-preview">${user.branch || ''}</p>
                    <p class="match-preview" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--bumble-yellow);">
                        ${skillsDisplay}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

function openChat(user) {
    currentChatUser = user;
    const modal = document.getElementById('chatModal');
    const chatAvatar = modal.querySelector('.chat-avatar');
    const chatName = modal.querySelector('.chat-name');
    
    chatAvatar.innerHTML = `<span style="font-size: 2rem;">${user.avatar || '👤'}</span>`;
    chatName.textContent = user.name;
    
    modal.classList.add('show');
    
    // Load chat history (in real app, load from backend)
    loadChatHistory(user.id);
}

function closeChat() {
    document.getElementById('chatModal').classList.remove('show');
    currentChatUser = null;
}

function unmatchUser(matchIndex) {
    if (confirm('Are you sure you want to unmatch with this person?')) {
        matches.splice(matchIndex, 1);
        localStorage.setItem('bumbELMatches', JSON.stringify(matches));
        updateMatchCount();
        renderMatches();
    }
}

function loadChatHistory(userId) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Sample initial message
    messagesContainer.innerHTML = `
        <div class="chat-starter">
            <p><i class="far fa-hand-peace"></i> Say hi and start planning your EL project!</p>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !currentChatUser) return;
    
    const messagesContainer = document.getElementById('chatMessages');
    
    // Add sent message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate response after 1-2 seconds
    setTimeout(() => {
        const responses = [
            "That sounds interesting! Tell me more about your idea.",
            "I'd love to collaborate on that! What technologies are you thinking?",
            "Great! When do you want to start working on this?",
            "Perfect! Let's set up a meeting to discuss this further.",
            "I'm excited about this project! What's the timeline?",
            "That's exactly what I was looking for! Let's do it!"
        ];
        
        const responseDiv = document.createElement('div');
        responseDiv.className = 'message received';
        responseDiv.textContent = responses[Math.floor(Math.random() * responses.length)];
        messagesContainer.appendChild(responseDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000 + Math.random() * 1000);
}

// Add some fun easter eggs
let clickCount = 0;
document.querySelector('.logo-icon').addEventListener('click', () => {
    clickCount++;
    if (clickCount === 5) {
        alert('You found the secret! Keep swiping to find your perfect EL team!');
        clickCount = 0;
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const activeView = document.querySelector('.view.active-view');
    if (activeView.id === 'discoverView') {
        if (e.key === 'ArrowLeft') {
            handleSwipe('nope');
        } else if (e.key === 'ArrowRight') {
            handleSwipe('like');
        } else if (e.key === 'ArrowUp') {
            handleSwipe('super');
        }
    }
});

console.log('bumbEL loaded! Start swiping to find your perfect EL teammates!');
console.log('Tip: Use arrow keys - Left: Pass, Right: Like, Up: Super Like');

// Profile Editing Functions
async function openEditProfile() {
    const modal = document.getElementById('editProfileModal');
    
    // Load fresh profile data if authenticated
    if (isAuthenticated) {
        try {
            const data = await API.getProfile();
            if (data.profile) {
                userProfile = data.profile;
            }
        } catch (err) {
            console.error('Failed to load profile for editing:', err);
        }
    }
    
    // Populate form with current profile data
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editBranch').value = userProfile.branch;
    document.getElementById('editYear').value = userProfile.year;
    document.getElementById('editSemester').value = userProfile.semester || '';
    // Populate looking-for checkboxes (structured) if available
    const editLookingInputs = document.querySelectorAll('#editLookingForGroup input[name^="looking_"]');
    if (editLookingInputs) {
        // Clear first
        editLookingInputs.forEach(i => i.checked = false);

        // Prefer structured choices from profile if available
        if (userProfile.lookingForChoices && Array.isArray(userProfile.lookingForChoices)) {
            // Map labels to keys
            const labelToKey = {
                'Web Development': 'looking_webdev',
                'Frontend': 'looking_frontend',
                'Backend': 'looking_backend',
                'Machine Learning': 'looking_ml',
                'AI': 'looking_ai',
                'Data Analysis': 'looking_data_analysis',
                'Mobile Development': 'looking_mobile',
                'Cloud Computing': 'looking_cloud',
                'DevOps': 'looking_devops',
                'Database': 'looking_database',
                'Cybersecurity': 'looking_cybersecurity',
                'UI/UX Design': 'looking_uiux',
                'Figma': 'looking_figma',
                'IoT': 'looking_iot',
                'Embedded Systems': 'looking_embedded'
            };

            userProfile.lookingForChoices.forEach(label => {
                const key = labelToKey[label];
                if (!key) return;
                const el = document.querySelector(`#editLookingForGroup input[name="${key}"]`);
                if (el) el.checked = true;
            });
            // Ensure visual checked state on parent labels
            editLookingInputs.forEach(i => i.parentElement.classList.toggle('checked', !!i.checked));
        } else {
            // Fallback to the comma-separated string
            const parts = (userProfile.lookingFor || '').split(',').map(s => s.trim()).filter(Boolean);
            parts.forEach(part => {
                // Try to find matching input by value/text
                editLookingInputs.forEach(i => {
                    const span = i.parentElement.querySelector('span');
                    if (span && span.textContent.trim().toLowerCase() === part.toLowerCase()) {
                        i.checked = true;
                    }
                    i.parentElement.classList.toggle('checked', !!i.checked);
                });
            });
        }
    }

    document.getElementById('editBio').value = userProfile.bio || '';
    document.getElementById('editInterests').value = (userProfile.interests || []).join(', ');
    
    // Populate skills
    renderSelectedSkills();
    
    modal.classList.add('show');
}

function closeEditProfile() {
    document.getElementById('editProfileModal').classList.remove('show');
}

function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skillCategory = document.getElementById('skillCategory');
    const skillName = skillInput.value.trim();
    
    if (!skillName) return;
    
    // Check if skill already exists
    const skillExists = userProfile.skills.some(skill => 
        skill.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (skillExists) {
        alert('This skill is already added!');
        skillInput.value = '';
        return;
    }
    
    // Add skill
    userProfile.skills.push({
        name: skillName,
        category: skillCategory.value
    });
    
    // Clear input and re-render
    skillInput.value = '';
    renderSelectedSkills();
}

function removeSkill(index) {
    userProfile.skills.splice(index, 1);
    renderSelectedSkills();
}

function renderSelectedSkills() {
    const container = document.getElementById('selectedSkills');
    
    if (userProfile.skills.length === 0) {
        container.innerHTML = '<p style="color: var(--bumble-gray); margin: 0;">No skills added yet</p>';
        return;
    }
    
    container.innerHTML = userProfile.skills.map((skill, index) => `
        <span class="skill-tag-editable ${skill.category}">
            ${skill.name}
            <button type="button" class="remove-skill" onclick="removeSkill(${index})">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

async function saveProfile(e) {
    e.preventDefault();
    
    // Get form values
    userProfile.name = document.getElementById('editName').value.trim();
    userProfile.branch = document.getElementById('editBranch').value;
    userProfile.year = document.getElementById('editYear').value;
    userProfile.semester = document.getElementById('editSemester').value;
    
    // Build lookingFor from checkboxes
    const lookingForLabels = [];
    document.querySelectorAll('#editLookingForGroup input[name^="looking_"]:checked').forEach(i => {
        const span = i.parentElement.querySelector('span');
        if (span) lookingForLabels.push(span.textContent.trim());
    });
    userProfile.lookingFor = lookingForLabels.join(', ');
    
    userProfile.bio = document.getElementById('editBio').value.trim();
    
    const interestsInput = document.getElementById('editInterests').value.trim();
    userProfile.interests = interestsInput ? interestsInput.split(',').map(i => i.trim()) : [];
    
    if (isAuthenticated) {
        try {
            // Build choices object that preserves existing choices and updates looking_for flags
            const updatedChoices = { ...(userProfile.choices || {}) };
            document.querySelectorAll('#editLookingForGroup input[name^="looking_"]').forEach(i => {
                updatedChoices[i.name] = i.checked;
            });

            await API.updateProfile({
                name: userProfile.name,
                branch: userProfile.branch,
                year: userProfile.year,
                semester: userProfile.semester,
                lookingFor: userProfile.lookingFor,
                bio: userProfile.bio,
                choices: updatedChoices
            });
            // Refresh profile from server to pick up formatted lookingForChoices
            try {
                const latest = await API.getProfile();
                if (latest?.profile) userProfile = latest.profile;
            } catch (err) {
                console.warn('Could not refresh profile after update:', err);
            }
            console.log('Profile saved to server');
        } catch (err) {
            console.error('Failed to save profile to server:', err);
            alert('Failed to save profile. Please try again.');
            return;
        }
    }
    
    // Save to localStorage (for offline mode)
    localStorage.setItem('bumbELUserProfile', JSON.stringify(userProfile));
    
    // Update profile display
    updateProfileDisplay();
    
    // Close modal
    closeEditProfile();
    
    // Show success message
    alert('Profile updated successfully!');
}

function updateProfileDisplay() {
    // Update profile view
    const profileCard = document.querySelector('.profile-card');
    if (!profileCard) return;
    
    const profileAvatar = profileCard.querySelector('.profile-avatar');
    const profileName = profileCard.querySelector('.profile-name');
    const profileBranch = profileCard.querySelector('.profile-branch');
    const profileYear = profileCard.querySelector('.profile-year');
    const skillsContainer = profileCard.querySelector('.skills-container');
    const lookingForContainer = profileCard.querySelector('.looking-for');
    const profileBio = profileCard.querySelector('.profile-bio');
    
    if (profileAvatar) {
        profileAvatar.innerHTML = `<span style="font-size: 4rem;">${userProfile.avatar || '👤'}</span>`;
    }
    if (profileName) profileName.textContent = userProfile.name;
    if (profileBranch) profileBranch.textContent = userProfile.branch;
    if (profileYear) profileYear.textContent = userProfile.year;
    
    if (skillsContainer && userProfile.skills) {
        skillsContainer.innerHTML = userProfile.skills.map(skill => 
            `<span class="skill-tag ${skill.category || 'tech'}">${skill.name}</span>`
        ).join('');
    }
    
    if (lookingForContainer) {
        let lookingForArray = [];
        if (Array.isArray(userProfile.lookingForChoices) && userProfile.lookingForChoices.length > 0) {
            lookingForArray = userProfile.lookingForChoices;
        } else if (userProfile.lookingFor) {
            lookingForArray = userProfile.lookingFor.split(',').map(item => item.trim());
        }
        lookingForContainer.innerHTML = lookingForArray.map(item => 
            `<span class="looking-tag">${item}</span>`
        ).join('');
    }
    
    if (profileBio) profileBio.textContent = userProfile.bio;
}

// Make loadDiscoverFeed globally available for onclick
window.loadDiscoverFeed = loadDiscoverFeed;
