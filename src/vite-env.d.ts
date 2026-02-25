/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_GUESTY_ADMIN_CLIENT_ID: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMetaInterface {
  readonly env: ImportMetaEnv
}

declare const importMeta: ImportMetaInterface
