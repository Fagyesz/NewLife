# Cloudflare Worker Secrets Setup

## Required Secrets

You need to set these secrets in your Cloudflare worker using the wrangler CLI:

### 1. YouTube API Key

```bash
# Set the YouTube Data API v3 key
wrangler secret put YOUTUBE_API_KEY
```

**How to get a YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the key to "YouTube Data API v3"
6. Copy the key and paste when prompted

### 2. Test Mode Channel ID

Before deploying, you need to get the Channel ID for @fagyi3970:

1. Go to https://www.youtube.com/@fagyi3970
2. Use a tool like [YouTube Channel ID Finder](https://commentpicker.com/youtube-channel-id.php)
3. Or check the page source for channel ID

## Deployment Commands

```bash
# Install wrangler if not installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put YOUTUBE_API_KEY

# Deploy the worker
wrangler deploy

# Test the deployment
curl https://status.bapti.hu/api/health
```

## Testing Commands

```bash
# Check health
curl https://status.bapti.hu/api/health

# Check live status (production)
curl https://status.bapti.hu/api/live

# Enable test mode
curl -X POST https://status.bapti.hu/api/test \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'

# Check live status (test mode)
curl https://status.bapti.hu/api/live

# Disable test mode
curl -X POST https://status.bapti.hu/api/test \
  -H "Content-Type: application/json" \
  -d '{"enable": false}'

# Check test mode status
curl https://status.bapti.hu/api/test
```

## Channel Configuration

- **Production**: @ujeletbaptistagyulekezet (UC3GbgMOUrfVnipHXvXQYFkA)
- **Test**: @fagyi3970 (UCftu1qQJZjQKHIXAjhDvFkw)

## Environment Variables in Angular

Update your environment files with the actual values:

```typescript
youtube: {
  mainChannelId: "UC3GbgMOUrfVnipHXvXQYFkA", // @ujeletbaptistagyulekezet
  testChannelId: "UCftu1qQJZjQKHIXAjhDvFkw", // @fagyi3970
  apiKey: "YOUR_YOUTUBE_API_KEY_HERE" // Only for client-side if needed
}
```

## Test Mode Usage

The worker automatically switches between production and test channels based on the test mode setting stored in KV storage. This allows you to test live streaming functionality without affecting the production channel monitoring. 