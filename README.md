# bumbEL Backend

A campus-level, web-based platform that helps students find project teammates using a swipe-based interface.

## Features

- **Swipe-based Matching**: Discover potential teammates with a Tinder/Bumble-like swipe interface
- **Custom Embedding Vectors**: Deterministic embedding generation based on user skills and interests
- **Cosine Similarity Matching**: Intelligent matching algorithm with controlled dissimilarity preference
- **Session-based Authentication**: Secure authentication with bcrypt password hashing
- **MySQL Database**: Persistent storage for users, profiles, matches, and swipes

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: Express-session with cookies
- **Password Hashing**: bcrypt
- **Frontend**: HTML, CSS, JavaScript (already built)

## Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL Server (local or remote)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and update with your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the following in `.env`:
   ```
   DB_HOST=localhost
   DB_DATABASE=bumbEL
   DB_USER=root
   DB_PASSWORD=your-password
   DB_PORT=3306
   SESSION_SECRET=your-secret-key
   ```

3. **Set up the database**:
   ```bash
   npm run db:setup
   ```
   
   Or manually run the SQL script in `db/schema.sql` in MySQL Workbench.

4. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   - Main app: http://localhost:3000
   - Register: http://localhost:3000/register
   - Login: http://localhost:3000/login

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user with profile |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout and destroy session |
| GET | `/api/auth/me` | Get current authenticated user |

### Discover & Swipe
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover` | Get ranked candidates for swiping |
| POST | `/api/swipe` | Record a swipe action |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get all matches for user |
| GET | `/api/matches/count` | Get match count |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user's profile |
| PUT | `/api/profile` | Update user profile |

## Matching Algorithm

### Embedding Vector
The system generates a fixed-length binary vector based on:
- **Skills** (15 dimensions): webdev, frontend, backend, ML, AI, data analysis, UI/UX, figma, IoT, embedded, mobile, cloud, devops, database, cybersecurity
- **Interests** (8 dimensions): startups, research, competitions, opensource, freelancing, networking, mentorship, hackathons
- **Experience** (3 dimensions): beginner, intermediate, advanced

Example: If a user selects Web Dev, UI/UX, Startups, and Intermediate experience:
```
[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
```

### Matching Constraints
1. **Minimum Overlap**: At least one shared skill OR same category required
2. **Cosine Similarity**: Calculated between embedding vectors
3. **Dissimilarity Preference**: Lower similarity = higher rank (complementary teammates)

### Exclusions
- Self
- Already swiped users
- Existing matches

## Database Schema

- **Users**: Core account information
- **UserProfiles**: Extended profile (branch, year, category, bio)
- **UserChoices**: Structured skill/interest selections
- **UserEmbeddings**: Generated embedding vectors (JSON)
- **Swipes**: User swipe history
- **Matches**: Mutual matches

## Project Structure

```
bumbEL/
├── config/
│   └── index.js          # Configuration settings
├── db/
│   ├── connection.js     # Database connection pool
│   ├── schema.sql        # SQL table definitions
│   └── setup.js          # Database setup script
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── validation.js     # Input validation
├── models/
│   ├── User.js           # User model
│   ├── UserProfile.js    # Profile model
│   ├── UserChoices.js    # Choices model
│   ├── UserEmbedding.js  # Embedding model
│   ├── Swipe.js          # Swipe model
│   └── Match.js          # Match model
├── routes/
│   ├── auth.js           # Auth routes
│   ├── discover.js       # Discover routes
│   ├── swipe.js          # Swipe routes
│   ├── matches.js        # Matches routes
│   └── profile.js        # Profile routes
├── services/
│   └── MatchingService.js # Matching algorithm
├── server.js             # Express server
├── app.js               # Frontend JavaScript
├── index.html           # Main app page
├── register.html        # Registration page
├── login.html           # Login page
├── styles.css           # Frontend styles
└── package.json         # Dependencies
```

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- HTTP-only session cookies
- Input validation with express-validator
- SQL parameterized queries (prevents injection)
- Session-based route protection

## License

ISC
