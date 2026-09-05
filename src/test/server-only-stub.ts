/**
 * `server-only` throws if it is imported into a client bundle. Under vitest
 * there is no bundle to protect, so it resolves to nothing — see the alias in
 * vitest.config.mts.
 */
export {};
