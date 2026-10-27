(()=>{"use strict";module.exports = [
"[project]/apps/admin/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/ui/src/index.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/admin/src/lib/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function AdminPage() {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null), [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [approvals, setApprovals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]), [signals, setSignals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]), [audit, setAudit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''), [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    async function load() {
        setLoading(true);
        setError('');
        try {
            const current = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].me();
            setUser(current);
            const [health, requests, market, auditRows] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].status(),
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].approvals(),
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].signals(),
                __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].audit()
            ]);
            setStatus(health);
            setApprovals(requests);
            setSignals(market);
            setAudit(auditRows);
        } catch (problem) {
            setUser(null);
            setError(problem instanceof Error ? problem.message : '조회에 실패했습니다');
        } finally{
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].me(),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].status(),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].approvals(),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].signals(),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].audit()
        ]).then(([current, health, requests, market, auditRows])=>{
            if (!active) return;
            setUser(current);
            setStatus(health);
            setApprovals(requests);
            setSignals(market);
            setAudit(auditRows);
            setError('');
        }).catch((problem)=>{
            if (!active) return;
            setUser(null);
            setError(problem instanceof Error ? problem.message : '조회에 실패했습니다');
        }).finally(()=>{
            if (active) setLoading(false);
        });
        return ()=>{
            active = false;
        };
    }, []);
    async function login(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setError('');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].signin(String(data.get('email')), String(data.get('password')));
            await load();
        } catch (problem) {
            setError(problem instanceof Error ? problem.message : '로그인에 실패했습니다');
        }
    }
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen grid place-items-center text-gray-400",
        children: "운영 상태를 확인하고 있습니다."
    }, void 0, false, {
        fileName: "[project]/apps/admin/src/app/page.tsx",
        lineNumber: 21,
        columnNumber: 21
    }, this);
    if (!user) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen grid place-items-center p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: login,
            className: "w-full max-w-sm rounded-lg border border-gray-700 bg-[#181a20] p-6 space-y-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brand"], {
                    label: "CEX 운영자"
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 190
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-gray-400",
                    children: "승인된 운영자 계정과 추가 인증 장치가 필요합니다."
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 214
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "email",
                    type: "email",
                    required: true,
                    placeholder: "이메일",
                    className: "w-full rounded bg-[#0b0e11] border border-gray-600 p-3"
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 283
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "password",
                    type: "password",
                    required: true,
                    placeholder: "비밀번호",
                    className: "w-full rounded bg-[#0b0e11] border border-gray-600 p-3"
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 411
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "alert",
                    className: "text-sm text-red-400",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 554
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "w-full rounded bg-yellow-500 py-3 font-semibold text-black",
                    children: "로그인"
                }, void 0, false, {
                    fileName: "[project]/apps/admin/src/app/page.tsx",
                    lineNumber: 22,
                    columnNumber: 615
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/admin/src/app/page.tsx",
            lineNumber: 22,
            columnNumber: 78
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/admin/src/app/page.tsx",
        lineNumber: 22,
        columnNumber: 19
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-gray-800 bg-[#181a20] px-6 py-4 flex justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brand"], {
                        label: "CEX 운영 통제"
                    }, void 0, false, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 24,
                        columnNumber: 94
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-gray-400",
                        children: [
                            user.email,
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "ml-4 text-yellow-500",
                                onClick: async ()=>{
                                    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$admin$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminApi"].logout();
                                    location.reload();
                                },
                                children: "로그아웃"
                            }, void 0, false, {
                                fileName: "[project]/apps/admin/src/app/page.tsx",
                                lineNumber: 24,
                                columnNumber: 172
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 24,
                        columnNumber: 120
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/admin/src/app/page.tsx",
                lineNumber: 24,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 grid gap-5 xl:grid-cols-2",
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        role: "alert",
                        className: "xl:col-span-2 rounded border border-red-800 bg-red-950 p-3",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 26,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
                        title: "운영 상태",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StateBadge"], {
                                        tone: status?.status === 'UP' ? 'good' : 'bad',
                                        children: status?.status ?? 'UNKNOWN'
                                    }, void 0, false, {
                                        fileName: "[project]/apps/admin/src/app/page.tsx",
                                        lineNumber: 27,
                                        columnNumber: 76
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        className: "text-xs text-gray-500",
                                        children: status?.observedAt
                                    }, void 0, false, {
                                        fileName: "[project]/apps/admin/src/app/page.tsx",
                                        lineNumber: 27,
                                        columnNumber: 170
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/admin/src/app/page.tsx",
                                lineNumber: 27,
                                columnNumber: 30
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-2",
                                children: status?.queues.map((queue)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between border-b border-gray-800 py-2 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: queue.name
                                            }, void 0, false, {
                                                fileName: "[project]/apps/admin/src/app/page.tsx",
                                                lineNumber: 27,
                                                columnNumber: 391
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: queue.pending ? 'text-yellow-500' : 'text-gray-400',
                                                children: [
                                                    queue.pending,
                                                    "건 · 최장 ",
                                                    queue.oldestSeconds ?? 0,
                                                    "초"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/admin/src/app/page.tsx",
                                                lineNumber: 27,
                                                columnNumber: 416
                                            }, this)
                                        ]
                                    }, queue.name, true, {
                                        fileName: "[project]/apps/admin/src/app/page.tsx",
                                        lineNumber: 27,
                                        columnNumber: 298
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/apps/admin/src/app/page.tsx",
                                lineNumber: 27,
                                columnNumber: 243
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 27,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
                        title: "승인 대기",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonRows, {
                            rows: approvals,
                            empty: "대기 중인 승인 요청이 없습니다."
                        }, void 0, false, {
                            fileName: "[project]/apps/admin/src/app/page.tsx",
                            lineNumber: 28,
                            columnNumber: 30
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 28,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
                        title: "시장감시 신호",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonRows, {
                            rows: signals,
                            empty: "확인할 시장감시 신호가 없습니다."
                        }, void 0, false, {
                            fileName: "[project]/apps/admin/src/app/page.tsx",
                            lineNumber: 29,
                            columnNumber: 32
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 29,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$ui$2f$src$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
                        title: "최근 감사 기록",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(JsonRows, {
                            rows: audit,
                            empty: "조회된 감사 기록이 없습니다."
                        }, void 0, false, {
                            fileName: "[project]/apps/admin/src/app/page.tsx",
                            lineNumber: 30,
                            columnNumber: 33
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/admin/src/app/page.tsx",
                        lineNumber: 30,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/admin/src/app/page.tsx",
                lineNumber: 25,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/admin/src/app/page.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
function JsonRows({ rows, empty }) {
    if (rows.length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-sm text-gray-500",
        children: empty
    }, void 0, false, {
        fileName: "[project]/apps/admin/src/app/page.tsx",
        lineNumber: 35,
        columnNumber: 104
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: rows.slice(0, 10).map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "overflow-auto rounded bg-[#0b0e11] p-3 text-xs text-gray-300",
                children: JSON.stringify(row, null, 2)
            }, String(row.id ?? index), false, {
                fileName: "[project]/apps/admin/src/app/page.tsx",
                lineNumber: 35,
                columnNumber: 222
            }, this))
    }, void 0, false, {
        fileName: "[project]/apps/admin/src/app/page.tsx",
        lineNumber: 35,
        columnNumber: 160
    }, this);
}
}),
"[project]/apps/admin/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminApi",
    ()=>adminApi
]);
function csrfCookie() {
    return document.cookie.split('; ').find((value)=>value.startsWith('cex_admin_csrf='))?.slice('cex_admin_csrf='.length) ?? null;
}
class AdminApi {
    async csrf() {
        const token = csrfCookie();
        if (token) return token;
        const response = await fetch('/api/session/csrf', {
            credentials: 'same-origin'
        });
        if (!response.ok) throw new Error('요청 보호 토큰을 만들지 못했습니다');
        return (await response.json()).token;
    }
    async request(path, options = {}) {
        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');
        if (options.method && options.method !== 'GET' && options.method !== 'HEAD') headers.set('X-CSRF-Token', await this.csrf());
        const response = await fetch(`/api/platform${path}`, {
            ...options,
            headers,
            credentials: 'same-origin',
            signal: options.signal ?? AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            const body = await response.json().catch(()=>({}));
            throw new Error(body.message ?? body.error ?? `요청 실패 (${response.status})`);
        }
        if (response.status === 204) return undefined;
        return response.json();
    }
    signin(email, password) {
        return this.request('/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });
    }
    me() {
        return this.request('/api/auth/me');
    }
    status() {
        return this.request('/api/admin/operations/status');
    }
    approvals() {
        return this.request('/api/admin/requests?page=0');
    }
    audit() {
        return this.request('/api/admin/audit?page=0');
    }
    signals() {
        return this.request('/api/admin/market-surveillance/signals?page=0');
    }
    logout() {
        return this.request('/api/auth/logout', {
            method: 'POST',
            body: '{}'
        });
    }
}
const adminApi = new AdminApi();
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
"[project]/packages/ui/src/index.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Brand",
    ()=>Brand,
    "Section",
    ()=>Section,
    "StateBadge",
    ()=>StateBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function Brand({ label = 'CEX' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-label": `${label} 홈`,
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 800,
            letterSpacing: '-0.03em'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": "true",
                style: {
                    display: 'grid',
                    placeItems: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: '#f0b90b',
                    color: '#111827'
                },
                children: "C"
            }, void 0, false, {
                fileName: "[project]/packages/ui/src/index.tsx",
                lineNumber: 5,
                columnNumber: 5
            }, this),
            label
        ]
    }, void 0, true, {
        fileName: "[project]/packages/ui/src/index.tsx",
        lineNumber: 4,
        columnNumber: 10
    }, this);
}
function Section({ title, description, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        style: {
            background: '#161a1e',
            border: '1px solid #2b3139',
            borderRadius: 8,
            padding: 20
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                style: {
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: 16,
                            fontWeight: 700,
                            margin: 0
                        },
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/packages/ui/src/index.tsx",
                        lineNumber: 12,
                        columnNumber: 39
                    }, this),
                    description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: '#929aa5',
                            fontSize: 13,
                            margin: '6px 0 0'
                        },
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/packages/ui/src/index.tsx",
                        lineNumber: 12,
                        columnNumber: 115
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/packages/ui/src/index.tsx",
                lineNumber: 12,
                columnNumber: 5
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/packages/ui/src/index.tsx",
        lineNumber: 11,
        columnNumber: 10
    }, this);
}
function StateBadge({ children, tone = 'neutral' }) {
    const colors = {
        neutral: [
            '#2b3139',
            '#d1d5db'
        ],
        good: [
            '#173c2c',
            '#32d583'
        ],
        warn: [
            '#493b15',
            '#f0b90b'
        ],
        bad: [
            '#48232a',
            '#f6465d'
        ]
    }[tone];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-flex',
            padding: '3px 8px',
            borderRadius: 999,
            background: colors[0],
            color: colors[1],
            fontSize: 12,
            fontWeight: 700
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/ui/src/index.tsx",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
}),
];})()

//# sourceMappingURL=_1hm-qyiksj-r3._.js.map