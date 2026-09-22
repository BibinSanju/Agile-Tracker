/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_KEY?: string;
  /** owner/name of the GitHub repo whose Actions status the UI displays. */
  readonly VITE_GITHUB_REPO?: string;
  /** Dev/E2E only: enables a stub session. Ignored in production builds. */
  readonly VITE_E2E_AUTH_BYPASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
