/**
 * Minimal Worker: serve the Vite SPA from the ASSETS binding.
 * Free-tool APIs / edge logic can land here later.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
}
