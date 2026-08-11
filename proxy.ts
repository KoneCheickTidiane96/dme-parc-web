import { NextResponse } from "next/server";

// Redirection vers /login desactivee tant que l'authentification n'est pas
// branchee sur l'API Laravel (sinon toutes les pages restent inaccessibles).
// A reactiver une fois le mecanisme d'auth choisi (Sanctum token vs cookie) :
//
// const SESSION_COOKIE = "dme_session";
//
// export function proxy(request: NextRequest) {
//   const hasSession = request.cookies.has(SESSION_COOKIE);
//   const { pathname } = request.nextUrl;
//
//   if (!hasSession && pathname !== "/login") {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//
//   if (hasSession && pathname === "/login") {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//
//   return NextResponse.next();
// }

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
