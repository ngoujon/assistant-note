import { NextResponse, type NextRequest } from "next/server";

// Optimistic-only check: we just look for the session cookie's presence to
// redirect early. This never touches the database (see Next.js's auth guide),
// so it must not be treated as the real authorization boundary — every page
// and Server Action re-verifies the session and workspace membership itself
// via `src/lib/dal.ts`.
const PUBLIC_PATHS = ["/login"];

function hasSessionCookie(request: NextRequest) {
  return [...request.cookies.getAll()].some((cookie) =>
    cookie.name.endsWith("authjs.session-token"),
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const authenticated = hasSessionCookie(request);

  if (!isPublic && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isPublic && authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
