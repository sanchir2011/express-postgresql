# ExpressJS + PostgreSQL Starter Kit by Sanchir Enkhbold

## version 1

- [x] Express 5.1.0
- [x] PostgreSQL 3.4.5
- [x] Drizzle 0.45.2
- [x] JWT 9.0.2
- [x] Resend 4.2.0
- [x] Zod 3.24.2
- [x] Sharp 0.35.3

Visit to my portfolio for more: <https://sanchir.dev>

### What's included?

- Pre-made authorization pages that include: Login, Register, Logout, Forgot Password, Reset Password, Verify Email.
- Google Cloud Storage integration.
- Middlewares
- CORS options

### Requirements

- **Node.js 20.9.0 or newer.** Sharp 0.35 dropped Node 18 support, so older versions fail at install time.
- A PostgreSQL database.

### Installation guide

 1. Clone this repository to your folder: `git clone https://github.com/sanchir2011/express-postgresql.git backend`
 2. Go to the folder where you cloned: `cd backend`
 3. Install all dependencies by running `npm install`
 4. Create `.env` file for development: `cp .env.example .env`
 5. Edit the created `.env` file:
 6. Replace variables.
 7. Now you are safe to run `npm run start` to start your Express Server.

Congratulations 🎉 You just created your Express REST API 😊.
If you liked it, please leave a star ⭐️. Thanks!

### Dependency notes

`package.json` carries an `overrides` block. It keeps `npm audit` at zero without downgrading anything:

- **`uuid`** — `@google-cloud/storage` pulls `uuid@9` in through `gaxios` and `teeny-request`. Forcing `^11.1.1` clears [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Upgrading `@google-cloud/storage` to 8.x would also fix it, but that release requires Node 22.
- **`@esbuild-kit/core-utils`** — `drizzle-kit` still ships the deprecated `@esbuild-kit/esm-loader`, which pins `esbuild@0.18`. Forcing `^0.25.12` clears [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99). There is no newer `drizzle-kit` to upgrade to — 0.31.10 is the latest and still carries the old loader.

⚠️ **Do not run `npm audit fix --force`.** npm's suggested fix for these two is to *downgrade* `drizzle-kit` to 0.18.1 and `@google-cloud/storage` to 5.x, which breaks migrations and file uploads.

If you ever change the `overrides` block, run a fresh install so it takes effect — npm ignores new overrides when an existing lockfile already pins the old resolution:

```bash
rm -rf node_modules package-lock.json && npm install
```
