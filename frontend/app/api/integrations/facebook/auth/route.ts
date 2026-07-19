import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'facebook';
  
  // We'll use a hardcoded mock business ID for now since we don't have a full auth session
  const businessId = 'mock_business_123';
  
  // Instead of redirecting to actual Facebook, we redirect to our local mock OAuth screen
  const mockFacebookUrl = new URL('http://localhost:3000/api/mock/facebook/oauth');
  mockFacebookUrl.searchParams.set('client_id', 'mock_app_id');
  mockFacebookUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/integrations/facebook/callback');
  mockFacebookUrl.searchParams.set('state', JSON.stringify({ businessId, provider }));
  mockFacebookUrl.searchParams.set('scope', 'pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish');

  return NextResponse.redirect(mockFacebookUrl.toString());
}
