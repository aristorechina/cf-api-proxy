// worker.js
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const url = new URL(request.url)
    const pathname = url.pathname
  
    // 处理根路径请求
    if (pathname === '/' || pathname === '/index.html') {
      return new Response('Cloudflare Proxy is Running!', {
        headers: { 'Content-Type': 'text/html' }
      })
    }
  
    // 构造目标URL（改进版）
    const targetPath = pathname.startsWith('/') ? pathname.slice(1) : pathname
    const targetUrl = `https://${targetPath}${url.search}` // 保留查询参数
  
    try {
      // 请求头过滤
      const safeHeaders = ['accept', 'content-type', 'authorization']
      const headers = new Headers()
      for (const [key, value] of request.headers) {
        if (safeHeaders.includes(key.toLowerCase())) {
          headers.set(key, value)
        }
      }
  
      // 转发请求
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body
      })
  
      // 修改响应头
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set('Referrer-Policy', 'no-referrer')
      responseHeaders.set('X-Proxy-By', 'Cloudflare-Worker')
  
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      })
    } catch (error) {
      // 错误处理
      console.error(`Proxy Error: ${error.message}`)
      return new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }