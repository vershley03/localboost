import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=access_denied', request.url));
  }

  if (code === 'mock_success_code_42') {
    // In a real flow, we would exchange the code for a short-lived token,
    // then exchange that for a long-lived token via Facebook Graph API,
    // and fetch the user's Pages and IG accounts:
    // const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);

    // Save to Database (Commented out because Prisma push currently fails due to Supabase being paused)
    /*
    try {
      await prisma.socialIntegration.create({
        data: {
          businessId: 'mock_business_123',
          provider: 'facebook',
          providerId: mockProviderId,
          accessToken: mockAccessToken,
          profileName: mockProfileName,
        }
      });
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.redirect(new URL('/dashboard?error=database_unreachable', request.url));
    }
    */

    // Redirect back to dashboard with a success flag
    return NextResponse.redirect(new URL('/dashboard?connected=facebook', request.url));
  }

  return NextResponse.redirect(new URL('/dashboard?error=invalid_code', request.url));
}
