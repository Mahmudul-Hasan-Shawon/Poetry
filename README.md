# The Poetry Archive

A quiet digital library of human thought. A premium, minimalist poetry and wisdom website serving as a digital literary archive for quotes, poetry, verses, and writings from Rumi, Mirza Ghalib, Rabindranath Tagore, and many more.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT with httpOnly cookies

## Getting Started

### 1. Install Dependencies

```bash
npm run setup
```

### 2. Run in Development

```bash
npm run dev
```

This starts:
- Client dev server at `http://localhost:5173`
- API server at `http://localhost:3001`

### 3. Production Build

```bash
npm run build
npm start
```

The Express server will serve the built React app at `http://localhost:3001`.

## Default Admin Login

- **Username:** `admin`
- **Password:** `[REDACTED]`

Update the password after first login. Default credentials are created on first database init.

## Project Structure

```
Poetry/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── layout/
│   │   │   ├── quotes/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express backend
│   ├── db/
│   │   ├── index.js        # Database initialization & schema
│   │   └── seed.js         # Sample data seeder
│   ├── middleware/
│   ├── routes/             # API routes
│   └── index.js            # Express server
└── package.json
```

## Features

### Public Website
- **Home:** Cinematic hero, word of the day, featured writings, author preview
- **Explore:** Search + filters by type, category, language, author
- **Authors:** Individual author pages with bios and writings
- **Collections:** Curated theme-based groupings
- **Quote Pages:** Beautiful reading experience with attribution, translations, related words
- **Random Discovery:** "Discover a Thought" button
- **Save/Favorites:** localStorage-based bookmarking
- **Copy/Share:** Elegant sharing actions
- **RTL Support:** Full right-to-left rendering for Urdu/Persian/Arabic
- **Responsive:** Mobile-first reading experience

### Admin Panel
- **Dashboard:** Overview stats (writings, authors, categories, collections)
- **Writings Management:** Create, edit, delete, duplicate, bulk actions, search
- **Author Management:** Full CRUD with bios, dates, languages
- **Category Management:** Create/edit/delete categories
- **Collection Management:** Create/edit collections
- **Daily Word:** Manually set today's word
- **Featured:** Toggle featured status
- **Import/Export:** JSON/CSV backup and restore
- **Preview:** See writing as it appears publicly before publishing

### Content Features
- Multilingual support (original + translations separated)
- Editorial verification status (Verified / Attributed / Unverified)
- Full source attribution (book, chapter, page, translator, URL, notes)
- Draft/Published/Archived workflow
- Type system: Quote, Poetry, Ghazal, Verse, Proverb, Wisdom, Reflection, Letter

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Check auth status |
| GET | `/api/writings` | List published writings (paginated) |
| GET | `/api/writings/featured` | Featured writings |
| GET | `/api/writings/random` | Random writing |
| GET | `/api/writings/daily` | Today's word |
| GET | `/api/writings/slug/:slug` | Get writing by slug |
| POST | `/api/writings` | Create writing (admin) |
| PUT | `/api/writings/:id` | Update writing (admin) |
| DELETE | `/api/writings/:id` | Delete writing (admin) |
| GET | `/api/authors` | List authors |
| GET | `/api/authors/:slug` | Get author with writings |
| POST/PUT/DELETE | `/api/authors` | Author CRUD (admin) |
| GET | `/api/categories` | List categories |
| GET | `/api/collections` | List collections |
| GET | `/api/collections/:slug` | Get collection with writings |
| GET | `/api/search?q=love` | Search writings, authors, categories, collections |
| GET | `/api/analytics/overview` | Admin dashboard stats |
| GET | `/api/export/json` | Export database as JSON |
| GET | `/api/export/csv` | Export writings as CSV |

## Security Notes

- Admin credentials are hashed with bcrypt
- JWT stored in httpOnly cookies
- All `/api/...` routes under admin protection require authentication
- Admin UI routes (`/admin`) are protected client-side, but the API is the real gatekeeper
- Session expires after 7 days
- Change the default password immediately
- Set `JWT_SECRET` environment variable in production

## Roadmap (Future Features)

- User accounts with full favorites sync
- Comments on writings
- Public submissions
- Author following
- Personalized recommendations
- Reading history
- Audio readings / text-to-speech
- Podcast-style poetry
- Daily email subscriptions
- Mobile app
- AI-powered semantic search
- Image optimization with WebP/AVIF