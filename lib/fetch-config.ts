/**
 * 全局 fetch 配置 - 解决 Google OAuth 连接超时问题
 *
 * 功能特性：
 * 1. 🔄 智能重试机制：Google OAuth 请求失败时自动重试最多 3 次
 * 2. ⏱️ 递增超时时间：第 1 次 30 秒，第 2 次 30 秒，第 3 次 45 秒
 * 3. 🌐 代理支持：自动检测并使用 http_proxy/https_proxy 环境变量
 * 4. 🚀 双重代理配置：同时支持标准 HTTP 代理和 undici ProxyAgent
 * 5. 📡 连接池优化：增强的 keep-alive 和连接复用设置
 *
 * 解决的问题：
 * - Better Auth Google OAuth 的 ConnectTimeoutError
 * - ETIMEDOUT 网络超时错误
 * - 代理环境下的连接问题
 *
 * 使用场景：
 * - 在网络较慢的环境中稳定连接 Google OAuth
 * - 通过代理服务器访问 Google 服务
 * - 需要增强网络请求可靠性的场景
 */

/**
 * 智能重试 fetch 函数
 *
 * @param originalFetch - 原始的 fetch 函数
 * @param input - 请求的 URL 或 Request 对象
 * @param init - 请求配置选项
 * @param retries - 最大重试次数（默认 3 次）
 * @returns Promise<Response> - HTTP 响应对象
 */
async function fetchWithRetry(
  originalFetch: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries = 3
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = attempt === 1 ? 30_000 : attempt * 15_000; // 递增超时时间
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await originalFetch(input, {
        ...init,
        signal: init?.signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;

      // 如果是最后一次尝试，或者不是网络超时错误，直接抛出
      const errorObj = error as any;
      if (
        attempt === retries ||
        (!errorObj.name?.includes('Abort') &&
          !errorObj.message?.includes('ETIMEDOUT') &&
          !errorObj.message?.includes('timeout') &&
          !errorObj.cause?.code?.includes('TIMEOUT'))
      ) {
        throw error;
      }

      // 等待一段时间后重试，递增等待时间
      const waitTime = attempt * 1000;
      console.log(
        `🔄 网络请求超时，${waitTime}ms 后进行第 ${attempt + 1} 次重试...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

// 在 Node.js 环境中配置全局代理超时时间
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  // 设置 Node.js 全局代理的超时时间
  const http = require('http');
  const https = require('https');

  // 检查是否有代理设置
  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;

  // 创建支持代理的 Agent
  if (httpProxy) {
    try {
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyAgent = new HttpsProxyAgent(httpsProxy || httpProxy);
      proxyAgent.timeout = 45_000;
      proxyAgent.keepAlive = true;
      proxyAgent.keepAliveMsecs = 60_000;
      https.globalAgent = proxyAgent;
      console.log(`🌐 使用 HTTPS 代理: ${httpsProxy || httpProxy}`);
    } catch (error) {
      console.log('⚠️ https-proxy-agent 不可用，使用标准代理配置');
    }
  } else {
    // 增加 HTTP 代理的超时时间
    if (http.globalAgent) {
      http.globalAgent.timeout = 45_000;
      http.globalAgent.keepAlive = true;
      http.globalAgent.keepAliveMsecs = 60_000;
      http.globalAgent.maxSockets = 50;
      http.globalAgent.maxFreeSockets = 10;
    }

    // 增加 HTTPS 代理的超时时间
    if (https.globalAgent) {
      https.globalAgent.timeout = 45_000;
      https.globalAgent.keepAlive = true;
      https.globalAgent.keepAliveMsecs = 60_000;
      https.globalAgent.maxSockets = 50;
      https.globalAgent.maxFreeSockets = 10;
    }
  }

  // 尝试配置 undici 全局代理（如果可用）
  try {
    const undici = require('undici');
    if (undici?.Agent && undici?.setGlobalDispatcher) {
      let globalAgent: any;

      // 如果有代理设置，使用 ProxyAgent
      if (httpsProxy || httpProxy) {
        const proxyUrl = httpsProxy || httpProxy;
        globalAgent = new undici.ProxyAgent({
          uri: proxyUrl,
          // 连接超时设置为 45 秒
          connectTimeout: 45_000,
          // 请求头超时设置为 45 秒
          headersTimeout: 45_000,
          // body 超时设置为 90 秒
          bodyTimeout: 90_000,
          // keep-alive 设置
          keepAliveTimeout: 60_000,
          keepAliveMaxTimeout: 600_000,
        });
        console.log(`🌐 undici 使用代理: ${proxyUrl}`);
      } else {
        globalAgent = new undici.Agent({
          // 连接超时设置为 45 秒
          connectTimeout: 45_000,
          // 请求头超时设置为 45 秒
          headersTimeout: 45_000,
          // body 超时设置为 90 秒
          bodyTimeout: 90_000,
          // keep-alive 设置
          keepAliveTimeout: 60_000,
          keepAliveMaxTimeout: 600_000,
          // 连接池设置
          maxCachedSessions: 100,
          // 每个源的最大连接数
          connections: 50,
        });
      }

      undici.setGlobalDispatcher(globalAgent);
      console.log('✅ 已配置 undici 全局代理，连接超时 45 秒');
    }
  } catch (error) {
    // undici 可能不可用，继续使用标准 HTTP 代理配置
    console.log('📡 使用标准 HTTP/HTTPS 代理配置，连接超时 45 秒');
  }

  // 设置全局 fetch 重试机制
  const originalFetch = globalThis.fetch;
  if (originalFetch && typeof originalFetch === 'function') {
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // 对于 Google OAuth 相关的请求，使用重试机制
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input?.url;
      const isGoogleOAuth =
        url.includes('googleapis.com') ||
        url.includes('accounts.google.com') ||
        url.includes('oauth2.googleapis.com');

      if (isGoogleOAuth) {
        return fetchWithRetry(originalFetch, input, init, 3);
      }

      // 非 Google OAuth 请求使用标准处理
      return fetchWithRetry(originalFetch, input, init, 1);
    };
  }
}

// 检查代理配置并显示状态
const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
const proxyStatus =
  httpProxy || httpsProxy ? `使用代理: ${httpsProxy || httpProxy}` : '直接连接';

console.log(
  `🔧 已加载 Google OAuth 连接超时配置 (45秒超时 + 重试机制, ${proxyStatus})`
);
