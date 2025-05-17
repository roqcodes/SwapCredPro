# Deploying SwapCred on Vercel

This guide explains how to deploy the entire SwapCred application (both frontend and backend) on Vercel.

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [GitHub repository](https://github.com/) with your SwapCred code
3. All your environment variables ready

## Deployment Steps

### 1. Push Code to GitHub

Make sure your code is pushed to a GitHub repository with the following structure:
- Root package.json (for running both client and server)
- vercel.json (for Vercel configuration)
- api/index.js (for Vercel serverless functions)
- client/ directory (React frontend)
- server/ directory (Express backend)

### 2. Connect to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Add New..." > "Project"
3. Import your GitHub repository
4. Select the repository containing your SwapCred code

### 3. Configure Environment Variables

Add all your required environment variables in the Vercel dashboard:

```
# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Shopify
SHOPIFY_STORE_URL=your_store_url
SHOPIFY_ACCESS_TOKEN=your_access_token

# Other variables as needed
```

**Important:** For `FIREBASE_PRIVATE_KEY`, make sure to include the quotes in the value: `"-----BEGIN PRIVATE KEY-----\nXXXX...\n-----END PRIVATE KEY-----\n"`

### 4. Configure Build and Development Settings

Your project should automatically use the settings from `vercel.json`, but you can verify:

- Build Command: Leave as default (uses vercel.json)
- Output Directory: Leave as default (uses vercel.json)
- Install Command: `npm install`
- Development Command: `npm run dev`

### 5. Deploy

Click "Deploy" and wait for the deployment to complete.

## Running Locally

To run the full application locally with a single command:

```bash
npm install
npm run dev
```

This will start both the client and server concurrently.

## Troubleshooting

### CORS Issues

If you encounter CORS issues, check the allowed origins in `server/index.js`:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.VERCEL_URL, 'https://your-domain.vercel.app']
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];
```

Update the production URLs to match your Vercel deployment URL.

### Environment Variables

If the server can't access environment variables:

1. Make sure all environment variables are set in Vercel dashboard
2. For local development, create a `.env` file in the root directory

### API Routes Not Working

If your API routes are not working:

1. Check server logs in Vercel dashboard
2. Ensure the API route pattern in `vercel.json` is correct
3. Verify that `api/index.js` is properly importing your Express app

### Deployment Failed

If your deployment fails:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are correctly listed in package.json files
3. Verify that your Vercel configuration is correct

## Notes

- All API routes should start with `/api/`
- This setup avoids needing separate hosting for the backend
- Vercel has a serverless function limit of 10 seconds for execution time 