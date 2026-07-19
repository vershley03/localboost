import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirect_uri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');

  // Return a simple HTML page simulating the Facebook Authorization screen
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Facebook Mock Login</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          h1 { color: #1877f2; margin-top: 0; }
          p { color: #606770; margin-bottom: 24px; line-height: 1.5; }
          .btn { display: inline-block; background: #1877f2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background 0.2s; }
          .btn:hover { background: #166fe5; }
          .btn-cancel { background: #e4e6eb; color: #4b4f56; margin-left: 12px; }
          .btn-cancel:hover { background: #d8dadf; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>facebook</h1>
          <h2>PinSpark is requesting access</h2>
          <p>PinSpark would like to manage your Pages, publish as your Pages, and access your Instagram Business accounts.</p>
          <div>
            <a href="${redirect_uri}?code=mock_success_code_42&state=${encodeURIComponent(state || '')}" class="btn">Continue as Sarah</a>
            <a href="${redirect_uri}?error=access_denied" class="btn btn-cancel">Cancel</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
