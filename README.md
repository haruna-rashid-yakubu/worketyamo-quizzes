<h1 align="center">⚡ Next JS & Supabase Auth Boilerplate ⚡</h1>
<p align="center">A super simple starting point for people learning how to authenticate users using latest NextJS 14 and Supabase SSR provided by DaveyReno.com</p>

## Includes

- ✅ Register
- ✅ Login
- ✅ Forgot Password (Incl. email)
- ✅ Update Password

## It is...

- ✅ Perfect for beginners
- ✅ Based on official Supabase docs

## It's not...

- ❌ Crazy advanced
- ❌ Difficult to understand

## Using

- ⚛️ React 18
- 📐 Shadcn UI
- 🎨 Tailwind
- 👷🏼 TypeScript
- 📋 Zod Form Validation

## Get auth'in!

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)


2. Use `cd` to change into the app's directory

   ```bash
   cd name-of-new-app
   ```

3. Rename `.env.local.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

4. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).
