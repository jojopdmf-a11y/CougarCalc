/**
 * Serve the Vite SPA from the ASSETS binding.
 * Staging (wrangler env `staging`) is not indexable.
 */
type Env = {
  ASSETS: { fetch: (input: Request) => Promise<Response> }
  ENVIRONMENT?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request)
    if (env.ENVIRONMENT !== 'staging') return response
    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
