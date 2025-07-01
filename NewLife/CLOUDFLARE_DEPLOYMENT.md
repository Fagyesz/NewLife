# 🚀 Cloudflare Worker Deployment Guide

## ✅ **Complete Setup Ready!**

Your Cloudflare worker is now fully configured with:
- ✅ **Main Channel**: @ujeletbaptistagyulekezet (UC3GbgMOUrfVnipHXvXQYFkA)  
- ✅ **Test Channel**: @fagyi3970 (UCftu1qQJZjQKHIXAjhDvFkw)
- ✅ **Test Mode Toggle**: API endpoints ready
- ✅ **Environment Configuration**: All files updated

## 🔧 **Deployment Steps**

### 1. **Get YouTube API Key**
```bash
# Go to Google Cloud Console
# https://console.cloud.google.com/
# 1. Create/select project
# 2. Enable "YouTube Data API v3"
# 3. Create API Key
# 4. Restrict to YouTube Data API v3
```

### 2. **Deploy to Cloudflare**
```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set the YouTube API secret
wrangler secret put YOUTUBE_API_KEY
# Paste your YouTube API key when prompted

# Deploy the worker
wrangler deploy

# Verify deployment
curl https://status.bapti.hu/api/health
```

### 3. **Test the Setup**
```bash
# Check health
curl https://status.bapti.hu/api/health

# Check live status (production mode)
curl https://status.bapti.hu/api/live

# Enable test mode
curl -X POST https://status.bapti.hu/api/test \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'

# Check live status (now uses @fagyi3970)
curl https://status.bapti.hu/api/live

# Disable test mode (back to main channel)
curl -X POST https://status.bapti.hu/api/test \
  -H "Content-Type: application/json" \
  -d '{"enable": false}'
```

## 📊 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Worker health check |
| `/api/live` | GET | Live stream status |
| `/api/test` | GET | Test mode status |
| `/api/test` | POST | Toggle test mode |

## 🎯 **Expected Responses**

### Health Check
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "testMode": false,
  "activeChannel": "Új Élet Baptista Gyülekezet",
  "version": "1.0.0"
}
```

### Live Status (LIVE)
```json
{
  "isLive": true,
  "title": "Vasárnapi Istentisztelet",
  "description": "Új Élet Baptista Gyülekezet élő közvetítése",
  "thumbnailUrl": "https://...",
  "videoId": "abc123",
  "channelTitle": "Új Élet Baptista Gyülekezet",
  "viewerCount": 42,
  "startedAt": "2024-01-01T10:00:00Z",
  "lastChecked": "2024-01-01T10:30:00.000Z",
  "channel": {
    "id": "UC3GbgMOUrfVnipHXvXQYFkA",
    "handle": "@ujeletbaptistagyulekezet",
    "name": "Új Élet Baptista Gyülekezet"
  }
}
```

### Live Status (OFFLINE)
```json
{
  "isLive": false,
  "lastChecked": "2024-01-01T10:30:00.000Z",
  "channel": {
    "id": "UC3GbgMOUrfVnipHXvXQYFkA",
    "handle": "@ujeletbaptistagyulekezet",
    "name": "Új Élet Baptista Gyülekezet"
  }
}
```

## 🧪 **Test Mode Usage**

### Enable Test Mode
```bash
curl -X POST https://status.bapti.hu/api/test \
  -H "Content-Type: application/json" \
  -d '{"enable": true}'
```

**Response:**
```json
{
  "testMode": true,
  "message": "Test mode enabled",
  "activeChannel": "Test Channel (fagyi3970)"
}
```

### Check Test Mode Status
```bash
curl https://status.bapti.hu/api/test
```

**Response:**
```json
{
  "testMode": true,
  "activeChannel": "Test Channel (fagyi3970)",
  "channels": {
    "production": {
      "id": "UC3GbgMOUrfVnipHXvXQYFkA",
      "handle": "@ujeletbaptistagyulekezet",
      "name": "Új Élet Baptista Gyülekezet"
    },
    "test": {
      "id": "UCftu1qQJZjQKHIXAjhDvFkw",
      "handle": "@fagyi3970",
      "name": "Test Channel (fagyi3970)"
    }
  }
}
```

## 🎮 **Admin Panel Integration**

Once deployed, your Angular admin panel will have:
- ✅ **Live test mode toggle**
- ✅ **Worker health monitoring**  
- ✅ **Active channel display**
- ✅ **Real-time status updates**

## 🚨 **Important Notes**

1. **YouTube API Quotas**: The free tier has 10,000 units/day quota
2. **Cache**: Results are cached for 30 seconds to save API calls
3. **CORS**: Worker includes proper CORS headers for your Angular app
4. **Error Handling**: Fallback mechanisms included for reliability
5. **Test Mode**: Persists until manually disabled

## 📝 **Next Steps**

After deployment:
1. **Test both channels** with live streams
2. **Monitor API quota usage** in Google Cloud Console
3. **Set up monitoring** for the worker health endpoint
4. **Update environment files** with actual API keys (remove templates)

Your live streaming monitoring system is now ready! 🎉 