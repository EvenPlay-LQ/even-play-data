# How to Deploy to Hostinger

This guide covers the step-by-step process for deploying the Even Playground frontend application to Hostinger.

## Prerequisites

1. An active Hostinger hosting account.
2. A registered domain configured in Hostinger.
3. Node.js installed on your local machine to build the project.
4. Access to Hostinger's hPanel (Dashboard) or FTP credentials.

---

## Step 1: Build the Application Locally

Before uploading files to Hostinger, you need to generate the production-ready build of your web application.

1. Open your terminal and navigate to your project directory.
2. Install any necessary dependencies if you haven't already:
   ```bash
   npm install
   ```
3. Run the build command:
   ```bash
   npm run build
   ```
4. This will create a `dist` folder in your project directory containing the optimized static files (HTML, CSS, JS).

> [!IMPORTANT]  
> Make sure your `.env.production` file is properly configured with your production Supabase URL and API keys before running the build step if those values differ from your local environment.

---

## Step 2: Configure Deployment to Hostinger

You can deploy your application automatically by pulling from GitHub, or by manually uploading files.

### Option A: Automated via GitHub Actions (Recommended)

This method lets GitHub Actions automatically build and push the production files to Hostinger every time you push to your branch.

1. **Get FTP Credentials:** In Hostinger hPanel, go to **Files -> FTP Accounts** to find your FTP Hostname (IP/Server), Username, and create a Password.
2. **Add GitHub Secrets:** Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**. Add the following secrets:
    * `FTP_SERVER`: Your Hostinger FTP Host (e.g., `ftp.yourdomain.com` or server IP)
    * `FTP_USERNAME`: Your FTP Username
    * `FTP_PASSWORD`: Your FTP Password
3. **Create Workflow File:** In your project, create the file `.github/workflows/deploy.yml`:
    ```yaml
    name: Deploy to Hostinger
    on:
      push:
        branches:
          - main
    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout Code
            uses: actions/checkout@v3
            
          - name: Set up Node.js
            uses: actions/setup-node@v3
            with:
              node-version: '20'
              
          - name: Install dependencies
            run: npm ci
            
          - name: Build project
            run: npm run build
            # Add environment variables here if needed
            
          - name: Sync files via FTP
            uses: SamKirkland/FTP-Deploy-Action@v4.3.4
            with:
              server: ${{ secrets.FTP_SERVER }}
              username: ${{ secrets.FTP_USERNAME }}
              password: ${{ secrets.FTP_PASSWORD }}
              local-dir: ./dist/
              server-dir: /public_html/
    ```
4. Push these changes to GitHub. The action will build the application and deploy the `dist` folder directly to your Hostinger server.

### Option B: Hostinger Git Integration (Pull natively from GitHub)

If you prefer Hostinger's native "GIT" pull mechanism rather than GitHub actions:

1. **Push your build:** Since Hostinger shared hosting won't run `npm run build` on the server automatically, you must first build your app locally (`npm run build`) and push the `dist` folder contents to a specific deployment branch (e.g., `production-build`).
2. **Link Repository:** In Hostinger hPanel, navigate to **Advanced -> GIT**.
3. **Configure:** Enter your GitHub repository (`username/repo`) and set the **Branch** to your built branch.
4. Set **Install Path** to `/public_html`.
5. Check **Auto Deployment** and Hostinger will fetch any future changes pushed to this branch. Alternatively, add Hostinger's specified Webhook to your GitHub repository (**Settings -> Webhooks**) to automate the pull.

### Option C: Manual Upload (File Manager / FTP)

1. Run `npm run build` locally.
2. Open **Hostinger File Manager** or an FTP client.
3. Navigate to `public_html` on the server and empty it.
4. Upload the **contents** of your local `dist` folder into `public_html`.

---

## Step 3: Configure Client-Side Routing (.htaccess)

Since this is a Vite/React Single Page Application (SPA), the browser handles routing on the client side. If a user tries to access a sub-page directly (e.g., `yourdomain.com/dashboard`), the Hostinger Apache server will look for a `dashboard` directory and return a 404 error. 

We need to tell the server to route all traffic to `index.html`.

1. Open **File Manager** in Hostinger hPanel.
2. Navigate to `public_html`.
3. Check if a `.htaccess` file exists. If it doesn't, click **New File** and name it `.htaccess`.
4. Right-click `.htaccess` and click **Edit**.
5. Paste the following configuration:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

6. Click **Save**.

---

## Step 4: Verify Deployment

1. Open your web browser and go to your domain name (e.g., `https://yourdomain.com`).
2. Verify that the homepage loads correctly.
3. Test the built-in routing by clicking on different links (e.g., login, dashboard).
4. Refresh a sub-page (e.g., `https://yourdomain.com/login`) to ensure the `.htaccess` configuration is working and doesn't return a 404 error.
5. Open browser Developer Tools (F12) and check the Console and Network tabs to make sure all assets (CSS, JS, Images) are loading correctly and there are no mixed content errors (HTTP/HTTPS).

> [!TIP]
> If you make future updates to the application, simply repeat Steps 1 and 2 to overwrite the files in `public_html`. Overwriting static files does not delete the `.htaccess` file unless you manually remove it.
