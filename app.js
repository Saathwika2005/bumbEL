// Sample Student Profiles Data
const studentProfiles = [
    {
        id: 1,
        name: "Aisha Sharma",
        avatar: "👩‍💻",
        branch: "Computer Science & Engineering",
        year: "3rd Year",
        semester: "6th Sem",
        skills: [
            { name: "Python", category: "tech" },
            { name: "Machine Learning", category: "tech" },
            { name: "Data Analysis", category: "tech" },
            { name: "TensorFlow", category: "tech" }
        ],
        lookingFor: "Frontend Developer, UI/UX Designer",
        bio: "AI enthusiast working on predictive analytics projects. Looking for creative minds to build innovative ML solutions!",
        interests: ["AI", "Data Science", "Research"]
    },
    {
        id: 2,
        name: "Rohan Patel",
        avatar: "🎨",
        branch: "Information Science & Engineering",
        year: "2nd Year",
        semester: "4th Sem",
        skills: [
            { name: "Figma", category: "design" },
            { name: "Adobe XD", category: "design" },
            { name: "UI/UX Design", category: "design" },
            { name: "Prototyping", category: "design" }
        ],
        lookingFor: "Full-stack Developer, Backend Expert",
        bio: "Design thinking advocate passionate about creating intuitive user experiences. Let's build something beautiful!",
        interests: ["Design", "User Research", "Product Design"]
    },
    {
        id: 3,
        name: "Priya Menon",
        avatar: "🚀",
        branch: "Electronics & Communication",
        year: "3rd Year",
        semester: "5th Sem",
        skills: [
            { name: "IoT", category: "tech" },
            { name: "Arduino", category: "tech" },
            { name: "Embedded Systems", category: "tech" },
            { name: "Circuit Design", category: "science" }
        ],
        lookingFor: "Software Developer, App Developer",
        bio: "Hardware hacker building smart IoT solutions. Need software wizards to bring my ideas to life!",
        interests: ["IoT", "Robotics", "Smart Devices"]
    },
    {
        id: 4,
        name: "Karthik Kumar",
        avatar: "💼",
        branch: "MBA",
        year: "1st Year",
        semester: "2nd Sem",
        skills: [
            { name: "Business Strategy", category: "business" },
            { name: "Marketing", category: "business" },
            { name: "Financial Analysis", category: "business" },
            { name: "Market Research", category: "business" }
        ],
        lookingFor: "Tech Developers, Designers",
        bio: "Business strategist with startup experience. Looking for tech talent to build viable products with market fit!",
        interests: ["Startups", "Strategy", "Innovation"]
    },
    {
        id: 5,
        name: "Sneha Reddy",
        avatar: "🔬",
        branch: "Biotechnology",
        year: "4th Year",
        semester: "7th Sem",
        skills: [
            { name: "Research", category: "science" },
            { name: "Data Analysis", category: "science" },
            { name: "Lab Techniques", category: "science" },
            { name: "Python", category: "tech" }
        ],
        lookingFor: "Data Scientists, Developers",
        bio: "Biotech researcher interested in bioinformatics. Seeking tech collaborators for healthcare innovation projects!",
        interests: ["Healthcare", "Bioinformatics", "Research"]
    },
    {
        id: 6,
        name: "Arjun Iyer",
        avatar: "⚡",
        branch: "Electrical & Electronics",
        year: "3rd Year",
        semester: "6th Sem",
        skills: [
            { name: "Power Systems", category: "science" },
            { name: "Control Systems", category: "tech" },
            { name: "MATLAB", category: "tech" },
            { name: "Renewable Energy", category: "science" }
        ],
        lookingFor: "Software Engineers, IoT Developers",
        bio: "Sustainable energy enthusiast working on smart grid solutions. Let's power the future together!",
        interests: ["Clean Energy", "Automation", "Sustainability"]
    },
    {
        id: 7,
        name: "Divya Krishnan",
        avatar: "📱",
        branch: "Computer Science & Engineering",
        year: "2nd Year",
        semester: "4th Sem",
        skills: [
            { name: "React Native", category: "tech" },
            { name: "Flutter", category: "tech" },
            { name: "Mobile Development", category: "tech" },
            { name: "Firebase", category: "tech" }
        ],
        lookingFor: "Backend Developers, Designers",
        bio: "Mobile app developer passionate about creating seamless cross-platform experiences. Let's ship something awesome!",
        interests: ["Mobile Apps", "Cross-platform", "UX"]
    },
    {
        id: 8,
        name: "Vikram Singh",
        avatar: "🎮",
        branch: "Computer Science & Engineering",
        year: "3rd Year",
        semester: "5th Sem",
        skills: [
            { name: "Unity", category: "tech" },
            { name: "C#", category: "tech" },
            { name: "Game Development", category: "tech" },
            { name: "3D Modeling", category: "design" }
        ],
        lookingFor: "Game Designers, Artists",
        bio: "Indie game developer creating immersive experiences. Need creative partners for my next gaming project!",
        interests: ["Gaming", "VR/AR", "Animation"]
    },
    {
        id: 9,
        name: "Ananya Gupta",
        avatar: "🌐",
        branch: "Information Science & Engineering",
        year: "4th Year",
        semester: "8th Sem",
        skills: [
            { name: "Blockchain", category: "tech" },
            { name: "Solidity", category: "tech" },
            { name: "Web3", category: "tech" },
            { name: "Smart Contracts", category: "tech" }
        ],
        lookingFor: "Full-stack Developers, Business Analysts",
        bio: "Blockchain enthusiast exploring decentralized applications. Join me in building the future of web3!",
        interests: ["Blockchain", "DeFi", "NFTs"]
    },
    {
        id: 10,
        name: "Rahul Nair",
        avatar: "🤖",
        branch: "Mechanical Engineering",
        year: "3rd Year",
        semester: "6th Sem",
        skills: [
            { name: "CAD", category: "design" },
            { name: "3D Printing", category: "tech" },
            { name: "Robotics", category: "tech" },
            { name: "Automation", category: "tech" }
        ],
        lookingFor: "Programmers, Electronics Engineers",
        bio: "Robotics enthusiast building autonomous systems. Need software and electronics experts to collaborate!",
        interests: ["Robotics", "Automation", "Manufacturing"]
    },
    {
        id: 11,
        name: "Meera Joshi",
        avatar: "📊",
        branch: "Industrial Engineering",
        year: "2nd Year",
        semester: "4th Sem",
        skills: [
            { name: "Data Visualization", category: "tech" },
            { name: "SQL", category: "tech" },
            { name: "Excel", category: "business" },
            { name: "Process Optimization", category: "business" }
        ],
        lookingFor: "Data Scientists, Developers",
        bio: "Analytics nerd optimizing processes through data. Looking for tech partners to build analytics dashboards!",
        interests: ["Analytics", "Operations", "Efficiency"]
    },
    {
        id: 12,
        name: "Siddharth Rao",
        avatar: "🎯",
        branch: "Computer Science & Engineering",
        year: "3rd Year",
        semester: "5th Sem",
        skills: [
            { name: "DevOps", category: "tech" },
            { name: "Docker", category: "tech" },
            { name: "Kubernetes", category: "tech" },
            { name: "AWS", category: "tech" }
        ],
        lookingFor: "Full-stack Developers, Frontend Engineers",
        bio: "Cloud infrastructure expert passionate about scalable systems. Let's build robust and reliable applications!",
        interests: ["Cloud Computing", "DevOps", "Infrastructure"]
    }
];

// Application State
let currentProfileIndex = 0;
let matches = [];
let currentFilter = 'tech';
let currentChatUser = null;
let dragStartX = 0;
let dragStartY = 0;
let isDragging = false;
let userProfile = {
    name: "You",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "6th Sem",
    skills: [
        { name: "JavaScript", category: "tech" },
        { name: "React", category: "tech" },
        { name: "Node.js", category: "tech" },
        { name: "UI/UX", category: "design" },
        { name: "Python", category: "tech" }
    ],
    lookingFor: "Backend Developer, ML Engineer, Designer",
    bio: "Passionate about web development and creating innovative solutions. Looking for dedicated teammates for EL projects!",
    interests: ["Web Development", "AI", "Mobile Apps"]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    initializeApp();
    setupEventListeners();
    loadProfiles();
    console.log('Profiles loaded, check card stack');
});

function initializeApp() {
    // Load saved matches from localStorage
    const savedMatches = localStorage.getItem('bumbELMatches');
    if (savedMatches) {
        matches = JSON.parse(savedMatches);
        updateMatchCount();
        renderMatches();
    }

    // Load saved user profile from localStorage
    const savedProfile = localStorage.getItem('bumbELUserProfile');
    if (savedProfile) {
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
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            currentProfileIndex = 0;
            loadProfiles();
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
        renderMatches();
    } else if (viewName === 'profile') {
        document.getElementById('profileView').classList.add('active-view');
    }
}

function loadProfiles() {
    const cardStack = document.querySelector('.card-stack');
    console.log('Card stack element:', cardStack);
    cardStack.innerHTML = '';

    let filteredProfiles = studentProfiles;
    console.log('Total profiles:', studentProfiles.length);
    
    // Always filter by selected category
    filteredProfiles = studentProfiles.filter(profile => 
        profile.skills.some(skill => skill.category === currentFilter)
    );

    console.log('Filtered profiles:', filteredProfiles.length);

    // Load only 1 profile at a time
    const profileIndex = currentProfileIndex % filteredProfiles.length;
    const profile = filteredProfiles[profileIndex];
    
    console.log('Loading profile:', profile?.name, 'matched:', matches.some(m => m.id === profile?.id));
    
    if (profile && !matches.some(m => m.id === profile.id)) {
        createProfileCard(profile, 0);
    }
    
    console.log('Cards in stack:', document.querySelectorAll('.profile-card-item').length);
}

function createProfileCard(profile, stackIndex) {
    console.log('Creating card for:', profile.name, 'at index:', stackIndex);
    const card = document.createElement('div');
    card.className = 'profile-card-item';
    card.dataset.profileId = profile.id;
    card.style.transform = `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.05})`;
    card.style.zIndex = 100 - stackIndex;

    const skillsHTML = profile.skills.map(skill => 
        `<span class="skill-tag ${skill.category}">${skill.name}</span>`
    ).join('');

    card.innerHTML = `
        <div class="card-avatar"><i class="fas fa-user-circle"></i></div>
        <div class="card-info">
            <h3 class="card-name">${profile.name}</h3>
            <div class="card-meta">
                <span class="meta-item"><i class="fas fa-book"></i> ${profile.branch}</span>
                <span class="meta-item"><i class="fas fa-graduation-cap"></i> ${profile.year}</span>
                <span class="meta-item"><i class="far fa-calendar"></i> ${profile.semester}</span>
            </div>
        </div>
        <div class="card-section">
            <h4>Looking For</h4>
            <p class="card-bio" style="color: var(--bumble-yellow); font-weight: 600;">${profile.lookingFor}</p>
        </div>
        <div class="card-section">
            <h4>About</h4>
            <p class="card-bio">${profile.bio}</p>
        </div>
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

function handleSwipe(action) {
    const cards = document.querySelectorAll('.profile-card-item');
    if (cards.length === 0) return;

    const topCard = cards[0];
    const profileId = parseInt(topCard.dataset.profileId);
    const profile = studentProfiles.find(p => p.id === profileId);

    if (!profile) return;

    // Animate swipe
    if (action === 'like' || action === 'super') {
        animateCardSwipe(topCard, 'like');
        
        // Random match chance (70% for super, 40% for regular like)
        const matchChance = action === 'super' ? 0.7 : 0.4;
        if (Math.random() < matchChance) {
            setTimeout(() => {
                createMatch(profile);
            }, 600);
        }
    } else {
        animateCardSwipe(topCard, 'nope');
    }

    // Load next profile after animation
    setTimeout(() => {
        currentProfileIndex++;
        loadProfiles();
    }, 300);
}

function createMatch(profile) {
    // Check if already matched
    if (matches.some(m => m.id === profile.id)) return;

    matches.push(profile);
    localStorage.setItem('bumbELMatches', JSON.stringify(matches));
    updateMatchCount();
    showMatchNotification(profile);
}

function showMatchNotification(profile) {
    const notification = document.getElementById('matchNotification');
    const matchedAvatar = notification.querySelector('.matched-avatar');
    const matchedName = document.getElementById('matchedName');
    
    matchedAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
    matchedName.textContent = profile.name;
    
    notification.classList.add('show');
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

    matchesGrid.innerHTML = matches.map((match, index) => `
        <div class="match-card" data-match-index="${index}">
            <button class="unmatch-btn" onclick="event.stopPropagation(); unmatchUser(${index});" title="Unmatch">
                <i class="fas fa-times"></i>
            </button>
            <div onclick="openChat(${JSON.stringify(match).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                <div class="match-avatar">
                    <i class="fas fa-user-circle"></i>
                    <div class="match-status"></div>
                </div>
                <h3 class="match-name">${match.name}</h3>
                <p class="match-preview">${match.branch}</p>
                <p class="match-preview" style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--bumble-yellow);">
                    ${match.skills.slice(0, 2).map(s => s.name).join(', ')}
                </p>
            </div>
        </div>
    `).join('');
}

function openChat(user) {
    currentChatUser = user;
    const modal = document.getElementById('chatModal');
    const chatAvatar = modal.querySelector('.chat-avatar');
    const chatName = modal.querySelector('.chat-name');
    
    chatAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
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
function openEditProfile() {
    const modal = document.getElementById('editProfileModal');
    
    // Populate form with current profile data
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editBranch').value = userProfile.branch;
    document.getElementById('editYear').value = userProfile.year;
    document.getElementById('editSemester').value = userProfile.semester;
    document.getElementById('editLookingFor').value = userProfile.lookingFor;
    document.getElementById('editBio').value = userProfile.bio;
    document.getElementById('editInterests').value = userProfile.interests.join(', ');
    
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

function saveProfile(e) {
    e.preventDefault();
    
    // Get form values
    userProfile.name = document.getElementById('editName').value.trim();
    userProfile.branch = document.getElementById('editBranch').value;
    userProfile.year = document.getElementById('editYear').value;
    userProfile.semester = document.getElementById('editSemester').value;
    userProfile.lookingFor = document.getElementById('editLookingFor').value.trim();
    userProfile.bio = document.getElementById('editBio').value.trim();
    
    const interestsInput = document.getElementById('editInterests').value.trim();
    userProfile.interests = interestsInput ? interestsInput.split(',').map(i => i.trim()) : [];
    
    // Save to localStorage
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
    
    const profileName = profileCard.querySelector('.profile-name');
    const profileBranch = profileCard.querySelector('.profile-branch');
    const profileYear = profileCard.querySelector('.profile-year');
    const skillsContainer = profileCard.querySelector('.skills-container');
    const lookingForContainer = profileCard.querySelector('.looking-for');
    const profileBio = profileCard.querySelector('.profile-bio');
    
    if (profileName) profileName.textContent = userProfile.name;
    if (profileBranch) profileBranch.textContent = userProfile.branch;
    if (profileYear) profileYear.textContent = userProfile.year;
    
    if (skillsContainer) {
        skillsContainer.innerHTML = userProfile.skills.map(skill => 
            `<span class="skill-tag ${skill.category}">${skill.name}</span>`
        ).join('');
    }
    
    if (lookingForContainer) {
        const lookingForArray = userProfile.lookingFor.split(',').map(item => item.trim());
        lookingForContainer.innerHTML = lookingForArray.map(item => 
            `<span class="looking-tag">${item}</span>`
        ).join('');
    }
    
    if (profileBio) profileBio.textContent = userProfile.bio;
}
