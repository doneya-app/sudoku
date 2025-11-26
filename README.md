# Sudoku PWA

A Progressive Web App (PWA) Sudoku puzzle game with URL-based game state sharing, allowing users to share puzzles and progress via URLs.

## Features

- Three difficulty levels (Easy, Medium, Hard)
- URL-based puzzle sharing with progress tracking
- Dark mode support
- Multiple color schemes
- Timer and error tracking
- Customizable UI visibility options
- Works offline (PWA)
- Mobile-friendly responsive design

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd sudoku

# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server runs on http://localhost:8080

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (includes build verification)
npm run build

# Build for production without verification
npm run build:prod

# Build for development mode (includes component tagging)
npm run build:dev

# Verify production build (check for test files)
npm run verify-build

# Lint code
npm run lint

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage report
npm test:coverage
```

## Technologies

This project is built with:

- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Component library (Radix UI primitives)
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities

## How It Works

### URL-Based Game State

All game state is encoded in the URL, making the app completely stateless:

- URL format: `/{difficulty}/{puzzle}?s={moves}&t={time}&e={errors}`
- `difficulty`: Single character (e/m/h)
- `puzzle`: 81-character string representing the initial puzzle
- `?s=` query param: Base62-encoded user moves (for sharing progress)
- `?t=` query param: Elapsed time in seconds
- `?e=` query param: Error count

### Game Statistics

- Timer and error count are tracked automatically
- Stats persist across page refreshes via localStorage
- Stats are included in shared URLs for progress tracking

## Deployment

This project can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect your repository or use `netlify deploy`
- **GitHub Pages**: Build and push `dist/` folder
- **Any static host**: Build with `npm run build` and deploy the `dist/` folder

## Documentation

See `CLAUDE.md` for detailed architecture and development documentation.

See `TESTING.md` for comprehensive testing documentation and best practices.

## License

[Your license here]
