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

The Vercel deployment toolbar has been disabled in this application through multiple methods. For the most reliable results, also disable the toolbar in the Vercel dashboard under Project Settings > General > Deployment Toolbar (toggle off).

1. The `vercel.json` file includes `"github": { "silent": true }` to reduce deployment notifications
2. Multiple meta tags are added to the HTML to disable Vercel UI elements:
   ```html
   <meta name="vercel-deployment-toolbar" content="false" />
   <meta name="vercel-toolbar" content="false" />
   <meta name="vercel-feedback" content="false" />
   ```
3. Enhanced CSS in `src/styles/vercel-override.css` uses multiple selectors to target and hide any Vercel UI elements
4. A robust JavaScript solution in `public/_document.js` that:
   - Removes Vercel UI elements on page load
   - Uses a MutationObserver to detect and remove dynamically added elements
   - Targets elements based on both attributes and computed styles

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
