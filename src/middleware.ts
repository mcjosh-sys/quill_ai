// import { authMiddleware } from "@kinde-oss/kinde-auth-nextjs/server"
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { absoluteUrl } from './lib/utils';

export const config = {
    matcher: ['/dashboard/:path*', "/auth-callback"]
}


export async function middleware(req: NextRequest) {
  
    const user = await getKindeServerSession().getUser()
    
    if (!user) {
      return NextResponse.redirect(absoluteUrl('/'));
    }
}



