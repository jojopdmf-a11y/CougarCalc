/**
 * Minimal Worker: serve the Vite SPA from the ASSETS binding.
 * Free-tool APIs / edge logic can land here later.
 */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (env.ENVIRONMENT !== 'staging') {
      return response
    }

    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
