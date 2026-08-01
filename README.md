# Naukri Auto Resume Uploader

Automatically re-uploads your resume to your Naukri account using Node.js and Playwright.

## ⚠️ Disclaimer
**For Personal Use Only**. This project is not intended to bypass any security measures like CAPTCHA or OTP. Please use it responsibly.

## Prerequisites
- Node.js 22 or higher
- A valid `resume/resume.pdf` file

## Installation

1. Navigate to the project directory:
   ```bash
   cd naukri-auto
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Install the required Playwright browsers:
   ```bash
   npx playwright install chromium
   ```
4. Place your resume as `resume/resume.pdf`.

## Setup Login (One-time)

You need to save your browser session to allow the script to log in automatically.

1. Run the login script:
   ```bash
   npm run login
   ```
2. A Chromium browser will open. Log in to your Naukri account manually.
3. Once you have successfully logged in, return to the terminal and press **ENTER**.
4. Your session will be saved in `auth.json`.

## Run the Uploader

To upload the resume automatically in headless mode:

```bash
npm run upload
```

The script will:
- Check if your session is still valid.
- Upload `resume/resume.pdf`.
- Take a screenshot upon success (saved in `screenshots/`).
- Log events to `logs/upload.log`.

## GitHub Actions Support

This project includes a `.github/workflows/upload.yml` workflow for automated daily uploads.
To use it:
1. Push this repository to GitHub.
2. Add your `auth.json` content as a Repository Secret named `NAUKRI_AUTH_JSON`.
3. The workflow will run daily automatically.
