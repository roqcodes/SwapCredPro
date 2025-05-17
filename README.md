# SwapCred

SwapCred is a product exchange and store credit management platform that allows customers to submit products for exchange and receive store credit based on the valuation of their items.

## Features

- **User Authentication**: Secure Firebase email-based authentication
- **Exchange Request Flow**: Submit and track product exchange requests
- **Shipping Integration**: Enter and track shipping details for approved exchanges
- **Store Credit System**: Receive and use store credit in Shopify store
- **Admin Dashboard**: Manage exchange requests, assign credit, and view credit history
- **Shopify Integration**: Store customer credit using both metafields and official Shopify Store Credit API

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- Firebase Authentication

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Firestore Database
- Shopify Admin API

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Firebase account
- Shopify Partner account

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd SwapCred
```

2. **Environment Variables**

Create `.env` file in the root directory with the following variables:

```
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

# Shopify
SHOPIFY_STORE_URL=your_store_url
SHOPIFY_ACCESS_TOKEN=your_access_token
```

3. **Install dependencies**

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

4. **Run the application**

Development mode:
```bash
# Run client and server concurrently
npm run dev
```

Production build:
```bash
# Build client
cd client
npm run build
cd ..

# Start server
npm start
```

## Project Structure

```
SwapCred/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # Context providers (Auth, etc.)
│   │   ├── pages/              # Page components
│   │   │   └── admin/          # Admin-specific pages
│   │   ├── theme/              # Material-UI theme configuration
│   │   └── App.jsx             # Main application component
│   └── package.json            # Frontend dependencies
├── server/                     # Backend Node.js application
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API routes
│   └── utils/                  # Utility functions
├── .env                        # Environment variables
├── package.json                # Backend dependencies
└── README.md                   # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `GET /api/auth/profile`: Get current user's profile
- `PUT /api/auth/profile`: Update user profile

### Exchange
- `POST /api/exchange`: Create a new exchange request
- `GET /api/exchange`: Get all exchange requests for current user
- `GET /api/exchange/:id`: Get a specific exchange request
- `PUT /api/exchange/:id`: Update an exchange request (shipping details)

### Admin
- `GET /api/admin/exchange-requests`: Get all exchange requests
- `GET /api/admin/exchange-requests/:id`: Get a specific exchange request
- `PUT /api/admin/exchange-requests/:id/status`: Update exchange request status
- `PUT /api/admin/exchange-requests/:id/transit`: Update transit status
- `PUT /api/admin/exchange-requests/:id/credit`: Assign credit to an exchange request
- `GET /api/admin/credit-history`: Get all credit history

### Shopify
- `GET /api/shopify/credit`: Get customer's credit balance
- `GET /api/shopify/credit-history`: Get credit history for current user

## Deployment

The application can be deployed using the following methods:

1. **Heroku**
   - Add the Heroku remote: `heroku git:remote -a your-app-name`
   - Push to Heroku: `git push heroku main`

2. **Firebase Hosting**
   - Deploy frontend to Firebase Hosting
   - Deploy backend to Cloud Functions

3. **Manual VPS Deployment**
   - Set up a Node.js server using PM2
   - Configure Nginx as a reverse proxy

## Cleaning Up the Project

To clean up unnecessary files before deployment:

```bash
# Run the cleanup script
bash cleanup.sh

# Or use the npm script
npm run clean
```

## License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.

## Support

For support and questions, please contact:
- Email: support@swapcred.com 