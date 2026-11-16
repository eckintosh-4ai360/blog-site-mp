This is the MP constituency portal, built with Next.js.

## Citizen submissions

Residents can send complaints, requests and suggestions from **Have Your Say** on the home page. They can attach up to three photos (3 MB each), one video (10 MB), and record a voice message (up to 2 minutes, 10 MB). A voice message can replace all typed fields; residents should say their name and contact details in the recording if they want a reply. Files upload directly to Cloudinary, then the server verifies each file before saving the submission to PostgreSQL. The office can play recordings, review reports and update their status at `/admin/submissions`. Microphone access requires HTTPS or localhost and browser permission.

Copy `.env.example` to `.env.local` and set the database, Cloudinary and admin values. Keep these values on the server only; configure the same variables in the deployment environment. `ADMIN_SESSION_SECRET` should be a long random value. Then run:

```bash
npm install
npm run setup-db
npm run dev
```

The submission API creates its table on first use. `setup-db` also creates it alongside the existing portal tables. Do not run `setup-db` against a production database unless its seed behavior is intended. Existing records are preserved.

The admin login now uses the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Submissions are readable and their statuses editable only with the signed admin session cookie. Cloudinary delivery URLs are unlisted but public to anyone with the URL, so the form should not be used for highly confidential evidence without a private media delivery setup.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
