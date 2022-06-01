import { extractFromSvelteConfig } from "vitest-svelte-kit"

/*
 * Without this, Vitest fails to parse .svelte files. Unfortunately,
 * vitest-svelte-kit is not an official part of SvelteKit, so there is the
 * possibility of breaking changes between them. This is something to keep an
 * eye out for when we update dependencies, but if our tests pass we should be
 * good.
 */
export default extractFromSvelteConfig()
