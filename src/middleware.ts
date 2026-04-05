import { getToken } from "next-auth/jwt";                                                              
  import { NextResponse } from "next/server";                                                            
  import type { NextRequest } from "next/server";                                                        
   
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];                       
                                                            
  export async function middleware(request: NextRequest) {                                               
    const { pathname } = request.nextUrl;                   

    const isSecure = request.url.startsWith("https");                                                    
    const cookieName = isSecure
      ? "__Secure-authjs.session-token"                                                                  
      : "authjs.session-token";                                                                          
   
    const token = await getToken({                                                                       
      req: request,                                         
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });                                                                                                  
   
    const isAuthed = !!token;                                                                            
                                                            
    if (pathname.startsWith("/invite/")) {                                                               
      if (!isAuthed) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));            
      }                                                                                                  
      return NextResponse.next();
    }                                                                                                    
                                                            
    if (authRoutes.some((route) => pathname === route)) {
      if (isAuthed) {
        return NextResponse.redirect(new URL("/onboarding", request.url));                               
      }
      return NextResponse.next();                                                                        
    }                                                       

    if (pathname.startsWith("/app/")) {                                                                  
      if (!isAuthed) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));            
      }                                                                                                  
      return NextResponse.next();
    }                                                                                                    
                                                            
    if (pathname.startsWith("/onboarding")) {
      if (!isAuthed) {
        return NextResponse.redirect(new URL("/login", request.url));
      }                                                                                                  
      return NextResponse.next();
    }                                                                                                    
                                                            
    return NextResponse.next();
  }

  export const config = {
    matcher: [
      "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],                                                                                                   
  };
