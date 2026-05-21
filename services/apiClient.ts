import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

// a simple error type that carries HTTP status and payload
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status = 0, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

function transformAxiosError(err: AxiosError): ApiError {
  const status = err.response?.status || 0;
  const data = err.response?.data as any;
  let message = err.message;

  // Handle nested error structure: { data: null, error: { status, message, details } }
  if (data && typeof data === 'object' && data.error && typeof data.error === 'object') {
    const errorObj = data.error;
    message = errorObj.message || errorObj.error || err.message || 'An error occurred';
  }
  // Handle flat error structure: { message, error, ... }
  else if (data && typeof data === 'object') {
    if (data.message) {
      message = data.message;
    } else if (data.error && typeof data.error === 'string') {
      message = data.error;
    }
  }

  const apiError = new ApiError(message, status, data);
  return apiError;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock behavior:
//   Default — hit the real API; if the request fails, fall back to mock data.
//   NEXT_PUBLIC_BYPASS_API=true (or window.__BYPASS_API=true) — skip the real API entirely, use mocks only.
//   NEXT_PUBLIC_DISABLE_MOCK_FALLBACK=true — never use mocks; surface backend errors (useful for debugging APIs).
// const FORCE_MOCK =
//   process.env.NEXT_PUBLIC_BYPASS_API === 'true' ||
//   (typeof window !== 'undefined' && (window as any).__BYPASS_API === true);
// const MOCK_FALLBACK_ENABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK_FALLBACK !== 'true';

// function createMockResponse<T>(data: T, status = 200): Promise<AxiosResponse<T>> {
//   return Promise.resolve({ data: data as T, status, statusText: 'OK', headers: {}, config: {}, request: {} } as AxiosResponse<T>);
// }

// async function mockHandler(method: string, url: string, payload?: any, params?: any) {
//   // normalize
//   const path = url.startsWith('/') ? url : `/${url}`;

//   // auth/login
//   if (method === 'post' && path.includes('/auth/login')) {
//     const { identifier } = payload || {};
//     const user = mockUsers.find(u => u.username === identifier || u.email === identifier) || mockUsers[0];
//     return createMockResponse({ jwt: 'mock-jwt-token', user });
//   }

//   if (method === 'post' && path.includes('/auth/signup')) {
//     const body = payload || {};
//     const newUser = { id: mockUsers.length + 1, username: body.username || `user${mockUsers.length + 1}`, email: body.email, displayName: body.displayName || body.username };
//     mockUsers.push(newUser as any);
//     return createMockResponse({ user: newUser }, 201);
//   }

//   if (method === 'get' && path === '/users/me') {
//     return createMockResponse(mockUsers[0]);
//   }

//   // profiles endpoints
//   if (method === 'get' && path === '/profiles/me') {
//     const profile = getProfile(1);
//     return createMockResponse({ data: profile });
//   }

//   if (method === 'get' && path === '/profiles') {
//     // support filters[user][id][$eq]
//     const userId = params && params['filters[user][id][$eq]'];
//     if (userId) {
//       const profile = getProfile(Number(userId));
//       return createMockResponse({ data: profile ? [profile] : [] });
//     }
//     return createMockResponse({ data: mockUsers.map((u) => ({ id: u.id, attributes: u })) });
//   }

//   // legacy single-profile routes used in other services
//   if (method === 'get' && path.startsWith('/profile')) {
//     const parts = path.split('/').filter(Boolean);
//     if (parts.length === 2 && parts[1] === 'me') {
//       const profile = getProfile(1);
//       return createMockResponse({ data: profile });
//     }
//     if (parts.length === 2) {
//       const id = Number(parts[1]);
//       const profile = getProfile(id);
//       return profile ? createMockResponse({ data: profile }) : createMockResponse(null, 404);
//     }
//     // /profile/user/:username
//     if (parts.length === 3 && parts[1] === 'user') {
//       const username = parts[2];
//       const user = mockUsers.find((u) => u.username === username) || null;
//       const profile = user ? getProfile(user.id) : null;
//       return createMockResponse({ data: profile });
//     }
//   }

//   if (method === 'get' && path.startsWith('/skills')) {
//     const parts = path.split('/').filter(Boolean);
//     if (parts.length === 1) {
//       // /skills list
//       return createMockResponse({ data: mockSkills, meta: { pagination: { total: mockSkills.length } } });
//     }
//     // /skills/:id
//     const id = Number(parts[1]);
//     const skill = findSkillById(id);
//     if (skill) return createMockResponse(skill);
//     return createMockResponse(null, 404);
//   }

//   if (method === 'get' && path.startsWith('/categories')) {
//     return createMockResponse({ data: mockCategories });
//   }

//   // current auth user
//   if (method === 'get' && path === '/auth/me') {
//     return createMockResponse({ data: { user: mockUsers[0] } });
//   }

//   if (method === 'get' && path.startsWith('/service-requests')) {
//     return createMockResponse({ data: mockServiceRequests });
//   }

//   // messages endpoint (filter by chat id)
//   if (method === 'get' && path.startsWith('/messages')) {
//     const chatFilter = params && params['filters[chat][id][$eq]'];
//     if (chatFilter) {
//       const chat = mockChats.find((c) => String(c.id) === String(chatFilter));
//       const msgs = chat ? chat.messages.map((m) => ({ ...m, chat: chat.id })) : [];
//       return createMockResponse({ data: msgs });
//     }
//     // return all messages flattened
//     const all = mockChats.flatMap((c) => c.messages.map((m) => ({ ...m, chat: c.id })));
//     return createMockResponse({ data: all });
//   }

//   // send message
//   if (method === 'post' && path === '/messages') {
//     const body = payload?.data || payload || {};
//     const chat = mockChats.find((c) => String(c.id) === String(body.chat));
//     const sender = mockUsers.find((u) => String(u.id) === String(body.senderId)) || mockUsers[0];
//     const recipient = mockUsers.find((u) => String(u.id) === String(body.recipientId)) || null;
//     const newMsg = {
//       id: 'm' + Date.now(),
//       chat: body.chat,
//       sender,
//       recipient,
//       content: body.content || '',
//       isRead: false,
//       createdAt: new Date().toISOString(),
//     } as any;
//     if (chat) {
//       chat.messages = chat.messages || [];
//       chat.messages.push(newMsg);
//     }
//     return createMockResponse({ data: newMsg }, 201);
//   }

//   // single message
//   if ((method === 'get' || method === 'put' || method === 'delete') && path.startsWith('/messages/')) {
//     const id = path.split('/').pop();
//     const chat = mockChats.find((c) => c.messages.some((m) => m.id === id));
//     const msg = chat ? chat.messages.find((m) => m.id === id) : null;
//     if (!msg) return createMockResponse(null, 404);
//     if (method === 'get') return createMockResponse({ data: msg });
//     if (method === 'put') {
//       // apply update
//       Object.assign(msg, payload?.data || payload);
//       return createMockResponse({ data: msg });
//     }
//     if (method === 'delete') {
//       if (chat) chat.messages = chat.messages.filter((m) => m.id !== id);
//       return createMockResponse({}, 204);
//     }
//   }

//   // chats
//   if (method === 'get' && path === '/chats') {
//     return createMockResponse({ data: mockChats });
//   }

//   if (method === 'get' && path.startsWith('/chats/')) {
//     const id = path.split('/').pop();
//     const chat = mockChats.find((c) => String(c.id) === String(id));
//     return chat ? createMockResponse({ data: chat }) : createMockResponse(null, 404);
//   }

//   // reviews
//   if (method === 'get' && path.startsWith('/reviews')) {
//     return createMockResponse({ data: mockReviews });
//   }

//   // reports
//   if (method === 'get' && path.startsWith('/reports')) {
//     return createMockResponse({ data: mockReports });
//   }

//   // notifications
//   if (method === 'get' && path === '/notifications') {
//     return createMockResponse({ data: mockNotifications });
//   }
//   if (method === 'put' && path === '/notifications/read-all') {
//     mockNotifications.forEach((n) => { n.isRead = true; });
//     return createMockResponse({ ok: true });
//   }
//   if (path.startsWith('/notifications/')) {
//     const segments = path.split('/').filter(Boolean);
//     const id = segments[1];
//     const action = segments[2];
//     const n = mockNotifications.find((x) => String(x.id) === String(id));
//     if (method === 'put' && action === 'read') {
//       if (!n) return createMockResponse(null, 404);
//       n.isRead = true;
//       return createMockResponse({ data: n });
//     }
//     if (method === 'delete') {
//       const idx = mockNotifications.findIndex((x) => String(x.id) === String(id));
//       if (idx >= 0) mockNotifications.splice(idx, 1);
//       return createMockResponse({}, 204);
//     }
//   }

//   // blocks
//   if (method === 'get' && path.startsWith('/blocks')) {
//     return createMockResponse({ data: [] });
//   }

//   // roles
//   if (method === 'get' && path.startsWith('/roles')) {
//     return createMockResponse({ data: [ { id: 1, name: 'user' }, { id: 2, name: 'admin' } ] });
//   }

//   // counts / dashboard
//   if (method === 'get' && (path === '/counts' || path === '/dashboard/counts')) {
//     return createMockResponse({ data: getCounts() });
//   }

//   // marketplace search
//   if (method === 'get' && path === '/marketplace/search') {
//     const q = params && (params._q || '');
//     return createMockResponse({ data: searchMarketplace(q) });
//   }

  

//   // fallback: return empty 200
//   return createMockResponse({}, 200);
// }

// Preserve the original axios methods so we can still hit the real backend
// even after we wrap them with the mock-fallback logic below.
const realGet = apiClient.get.bind(apiClient);
const realPost = apiClient.post.bind(apiClient);
const realPut = apiClient.put.bind(apiClient);
const realDelete = apiClient.delete.bind(apiClient);

function logFallback(method: string, url: string, err: any) {
  const status = err?.status ?? err?.response?.status ?? 'network';
  const msg = err?.message ?? 'unknown error';
  // eslint-disable-next-line no-console
  // API fallback to mock data
}

// async function callWithFallback(
//   method: 'get' | 'post' | 'put' | 'delete',
//   url: string,
//   payload: any,
//   config: any
// ): Promise<AxiosResponse<any>> {
//   if (FORCE_MOCK) {
//     return mockHandler(method, url, payload, config?.params) as Promise<AxiosResponse<any>>;
//   }

//   try {
//     switch (method) {
//       case 'get':
//         return await realGet(url, config);
//       case 'delete':
//         return await realDelete(url, config);
//       case 'post':
//         return await realPost(url, payload, config);
//       case 'put':
//         return await realPut(url, payload, config);
//     }
//   } catch (err) {
//     if (!MOCK_FALLBACK_ENABLED) throw err;
//     logFallback(method, url, err);
//     return mockHandler(method, url, payload, config?.params) as Promise<AxiosResponse<any>>;
//   }
// }

// (apiClient as any).get = (url: string, config?: any) => callWithFallback('get', url, undefined, config);
// (apiClient as any).post = (url: string, data?: any, config?: any) => callWithFallback('post', url, data, config);
// (apiClient as any).put = (url: string, data?: any, config?: any) => callWithFallback('put', url, data, config);
// (apiClient as any).delete = (url: string, config?: any) => callWithFallback('delete', url, undefined, config);

// attach auth header automatically (check localStorage first for "remember me", then sessionStorage)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// central response interceptor — transforms errors only.
// Auth-specific 401 handling (redirect to login) is done in AuthProvider
// so that non-critical endpoints (notifications, activity) don't force logout.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(transformAxiosError(error));
    }
    return Promise.reject(error);
  }
);

// helper for service modules: will rethrow transformed error or return a fallback
export async function safeRequest<T>(
  request: Promise<AxiosResponse<T>>,
  fallbackOn404?: T
): Promise<T> {
  try {
    const res = await request;
    return res.data as T;
  } catch (err: any) {
    // Handle 404 with fallback
    if (err instanceof ApiError && err.status === 404 && fallbackOn404 !== undefined) {
      return fallbackOn404;
    }
    throw err;
  }
}
