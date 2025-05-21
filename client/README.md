# Aeropulse - Respiratory Monitoring Application

A modern web application for monitoring and analyzing respiratory patterns, specifically designed for detecting and tracking wheezing levels.

## Deployment Instructions for Vercel

### Option 1: Deploy from the Vercel Dashboard

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your Git repository or upload the project files
4. Configure the project with the following settings:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In the project settings, go to "General" and disable "Deployment Toolbar"
6. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the client directory:
   ```bash
   cd client
   ```

3. Run the deployment command:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment.

## Environment Variables

No environment variables are required for basic deployment.

## Vercel Deployment Toolbar

The Vercel deployment toolbar has been disabled in this application through multiple methods:

1. The `vercel.json` file includes `"feedbackEnabled": false` to disable the toolbar
2. A meta tag `<meta name="vercel-deployment-toolbar" content="false" />` is added to the HTML
3. Custom CSS in `src/styles/vercel-override.css` hides any Vercel toolbar elements
4. A custom script in `public/_document.js` removes the toolbar if it appears

## Troubleshooting

If you encounter any issues during deployment:

1. Make sure Node.js version 18 or higher is being used
2. Verify that all dependencies are correctly installed
3. Check that the build process completes successfully locally
4. Ensure the vercel.json file is correctly configured

## Development

To run the application locally:

```bash
cd client
npm install
npm run dev
```

The application will be available at http://localhost:5173/
