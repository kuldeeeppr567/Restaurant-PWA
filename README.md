# Dosa Restaurant POS

> A Progressive Web App for managing a dosa restaurant

## Business Problem

A small Indian dosa restaurant offering 40+ dosa varieties currently manages everything with pen and paper. This PWA digitizes the entire workflow: table management, order-taking, kitchen communication, serving, refills, and billing -- replacing manual processes with an efficient digital system that runs on any device with a browser.

## Application Features

### Waiter
- Table management with status indicators (Available, Occupied, Reserved)
- Order-taking with special instructions per item
- Submit orders to kitchen
- Service and refill requests
- Mark items as served

### Kitchen / Chef
- Order queue with large, readable display
- Status updates: Pending -> Preparing -> Ready
- Time tracking per order
- Filter orders by status

### Cashier
- Bill calculation with itemized breakdown
- Discounts: fixed amount or percentage
- Tax calculation
- Payment method recording (Cash, Card, UPI)
- Printable receipt generation
- Close and free up tables after payment

### Owner / Admin
- Menu management: add, edit, and archive items
- Category and price management
- Table configuration
- Sales analytics with charts (daily, weekly, monthly)
- Application settings

### PWA Capabilities
- Installable on desktop and mobile devices
- Offline-capable after first load
- Service worker for caching
- IndexedDB for local data storage

## Technology Stack

- **UI**: React 19 with TypeScript (strict mode)
- **Build**: Vite
- **Routing**: React Router
- **Database**: Dexie.js (IndexedDB wrapper)
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin
- **Testing**: Vitest + React Testing Library
- **Styling**: Plain CSS (no framework)

## Local Installation

```bash
git clone https://github.com/kuldeeeppr567/Restaurant-PWA.git
cd Restaurant-PWA
npm install
npm run dev
```

The development server starts at `http://localhost:5173` by default.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Testing

```bash
npm test
```

Runs Vitest tests covering core business rules:

- Bill calculation with itemized totals
- Fixed and percentage discount application
- Tax computation
- Cancelled item exclusion from totals
- Price snapshot integrity (price at time of order)

## Production Build

```bash
npm run build
```

Output is written to the `dist/` directory, ready for static hosting.

## GitHub Pages Deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` for automated deployment.

1. Go to **Settings** -> **Pages** -> **Source**: select **GitHub Actions**
2. Push to the `main` branch to trigger an automatic build and deploy
3. The base path is automatically derived from the repository name via the `VITE_BASE_PATH` environment variable

To use a custom base path:

```bash
VITE_BASE_PATH=/custom-path/ npm run build
```

## PWA Installation

- **Chrome (Desktop)**: Click the install icon in the address bar
- **Chrome (Android)**: Tap the three-dot menu and select "Add to Home Screen"
- **Safari (iOS)**: Tap the Share button, then "Add to Home Screen"

The app works offline after the first load.

## IndexedDB Storage

**Important**: All data is stored locally in the browser's IndexedDB.

- Data is **not** synchronized between devices
- Each device and browser maintains its own independent database
- Clearing browser data will delete all records

## Known Limitations

- No real authentication (demo role selector only)
- No cloud sync between devices
- No real payment gateway integration
- Data is local to each browser/device
- No multi-restaurant support
- No real-time updates between screens (manual refresh needed)

## Security Notice

The role selection screen is **not** secure authentication. Any user can access any role. This is acceptable for a local demo or MVP. A production deployment would require proper authentication and authorization.

## Future Cloud Architecture

Recommended architecture for a production deployment:

- **Hosting**: Netlify or Vercel for the PWA
- **Auth**: Supabase Auth for real user authentication
- **Database**: Supabase PostgreSQL for cloud data storage
- **Security**: Row-Level Security for restaurant and user isolation
- **Backend**: Netlify Functions for sensitive operations
- **Config**: Environment variables for server-side secrets
- **AI**: AI services connected only through secure backend functions

Never include secret keys in frontend code.

## Demo Data

Use **Load Demo Data** from the home screen or Settings to populate the app with sample data:

- 10 restaurant tables
- 48 menu items across 10 categories
- Active orders in various statuses
- Pending service requests
- 15 historical completed orders for analytics

**Reset Demo Data** clears all data (with confirmation prompt).

## License

MIT
