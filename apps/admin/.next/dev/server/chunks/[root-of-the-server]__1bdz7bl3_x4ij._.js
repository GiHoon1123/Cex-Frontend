module.exports = [
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/apps/admin/src/app/api/platform/[...path]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
const accessCookie = 'cex_admin_access';
const refreshCookie = 'cex_admin_refresh';
const csrfCookie = 'cex_admin_csrf';
function platformOrigin() {
    const configured = process.env.PLATFORM_INTERNAL_URL;
    if (configured) return configured.replace(/\/$/, '');
    if ("TURBOPACK compile-time truthy", 1) return 'http://127.0.0.1:8080';
    //TURBOPACK unreachable
    ;
}
function mutation(method) {
    return ![
        'GET',
        'HEAD',
        'OPTIONS'
    ].includes(method);
}
function cookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'strict',
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        path: '/'
    };
}
function sameOrigin(request) {
    const origin = request.headers.get('origin');
    if (!origin) return false;
    try {
        const source = new URL(origin);
        const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
        return source.host === host && source.protocol === `${protocol}:`;
    } catch  {
        return false;
    }
}
async function proxy(request, { params }) {
    const path = (await params).path.join('/');
    const store = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    if (mutation(request.method)) {
        const token = request.headers.get('x-csrf-token');
        if (!sameOrigin(request) || !token || token !== store.get(csrfCookie)?.value) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: '요청 출처를 확인할 수 없습니다'
        }, {
            status: 403
        });
    }
    const headers = new Headers({
        'Content-Type': request.headers.get('content-type') ?? 'application/json'
    });
    const idempotency = request.headers.get('idempotency-key');
    if (idempotency) headers.set('Idempotency-Key', idempotency);
    const access = store.get(accessCookie)?.value;
    if (access) headers.set('Authorization', `Bearer ${access}`);
    let body = mutation(request.method) ? await request.text() : undefined;
    if (path === 'api/auth/refresh' || path === 'api/auth/logout') body = JSON.stringify({
        refreshToken: store.get(refreshCookie)?.value ?? ''
    });
    let upstream;
    try {
        upstream = await fetch(`${platformOrigin()}/${path}${request.nextUrl.search}`, {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: '플랫폼 응답을 확인할 수 없습니다'
        }, {
            status: 503
        });
    }
    const raw = await upstream.text();
    let payload = raw;
    try {
        payload = raw ? JSON.parse(raw) : null;
    } catch  {}
    if (payload && typeof payload === 'object') {
        const values = payload;
        const accessToken = typeof values.accessToken === 'string' ? values.accessToken : null;
        const refreshToken = typeof values.refreshToken === 'string' ? values.refreshToken : null;
        if (accessToken && refreshToken) {
            delete values.accessToken;
            delete values.refreshToken;
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(values, {
                status: upstream.status
            });
            response.cookies.set(accessCookie, accessToken, {
                ...cookieOptions(),
                maxAge: 15 * 60
            });
            response.cookies.set(refreshCookie, refreshToken, {
                ...cookieOptions(),
                maxAge: 7 * 24 * 3600
            });
            response.headers.set('Cache-Control', 'no-store');
            return response;
        }
    }
    const response = payload === null ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: upstream.status
    }) : typeof payload === 'string' ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](payload, {
        status: upstream.status
    }) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(payload, {
        status: upstream.status
    });
    if (path === 'api/auth/logout' || upstream.status === 401) {
        response.cookies.set(accessCookie, '', {
            ...cookieOptions(),
            maxAge: 0
        });
        response.cookies.set(refreshCookie, '', {
            ...cookieOptions(),
            maxAge: 0
        });
    }
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
const GET = proxy;
const POST = proxy;
const PUT = proxy;
const PATCH = proxy;
const DELETE = proxy;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1bdz7bl3_x4ij._.js.map