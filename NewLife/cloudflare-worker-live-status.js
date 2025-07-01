/**
 * Cloudflare Worker for Új Élet Baptista Gyülekezet Live Stream Status
 * Checks YouTube channels for live streams and caches results
 */

// Channel configurations
const CHANNELS = {
  production: {
    id: 'UC3GbgMOUrfVnipHXvXQYFkA', // @ujeletbaptistagyulekezet
    handle: '@ujeletbaptistagyulekezet',
    name: 'Új Élet Baptista Gyülekezet'
  },
  test: {
    id: 'UCftu1qQJZjQKHIXAjhDvFkw', // @fagyi3970
    handle: '@fagyi3970', 
    name: 'Test Channel (fagyi3970)'
  }
};

// Configuration
const CONFIG = {
  CACHE_TTL: 300, // 5 minutes (reduced API calls by 10x!)
  API_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Route handling
      switch (path) {
        case '/api/live':
          return handleLiveStatus(request, env);
        case '/api/test':
          return handleTestMode(request, env);
        case '/api/health':
          return handleHealthCheck(env);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return createErrorResponse('Internal Server Error', error.message);
    }
  },
};

/**
 * Handle live status check
 */
async function handleLiveStatus(request, env) {
  try {
    // Check if test mode is enabled
    const isTestMode = await env.LIVE_STATUS_CACHE.get('test_mode') === 'true';
    const channel = isTestMode ? CHANNELS.test : CHANNELS.production;
    
    console.log(`🎥 Checking live status for: ${channel.name} (${isTestMode ? 'TEST' : 'PROD'} mode)`);

    // Try to get cached result first
    const cacheKey = `live_status_${isTestMode ? 'test' : 'prod'}`;
    const cached = await env.LIVE_STATUS_CACHE.get(cacheKey);
    
    if (cached) {
      const cachedData = JSON.parse(cached);
      const age = Date.now() - cachedData.timestamp;
      
      if (age < CONFIG.CACHE_TTL * 1000) {
        console.log(`📋 Returning cached result (${Math.floor(age/1000)}s old)`);
        return createSuccessResponse(cachedData.data);
      }
    }

    // Fetch fresh data from YouTube
    const liveStatus = await checkYouTubeLiveStatus(channel, env);
    
    // Cache the result
    const cacheData = {
      data: liveStatus,
      timestamp: Date.now()
    };
    
    await env.LIVE_STATUS_CACHE.put(cacheKey, JSON.stringify(cacheData), {
      expirationTtl: CONFIG.CACHE_TTL * 2 // Cache for twice the TTL
    });

    return createSuccessResponse(liveStatus);
    
  } catch (error) {
    console.error('Live status error:', error);
    return createErrorResponse('Failed to check live status', error.message);
  }
}

/**
 * Handle test mode toggle
 */
async function handleTestMode(request, env) {
  try {
    if (request.method === 'POST') {
      const body = await request.json();
      const enable = body.enable === true;
      
      await env.LIVE_STATUS_CACHE.put('test_mode', enable ? 'true' : 'false');
      
      // Clear cached data when switching modes
      await env.LIVE_STATUS_CACHE.delete('live_status_prod');
      await env.LIVE_STATUS_CACHE.delete('live_status_test');
      
      return createSuccessResponse({
        testMode: enable,
        message: `Test mode ${enable ? 'enabled' : 'disabled'}`,
        activeChannel: enable ? CHANNELS.test.name : CHANNELS.production.name
      });
    } else {
      // GET - return current test mode status
      const isTestMode = await env.LIVE_STATUS_CACHE.get('test_mode') === 'true';
      return createSuccessResponse({
        testMode: isTestMode,
        activeChannel: isTestMode ? CHANNELS.test.name : CHANNELS.production.name,
        channels: CHANNELS
      });
    }
  } catch (error) {
    console.error('Test mode error:', error);
    return createErrorResponse('Failed to handle test mode', error.message);
  }
}

/**
 * Health check endpoint
 */
async function handleHealthCheck(env) {
  try {
    const isTestMode = await env.LIVE_STATUS_CACHE.get('test_mode') === 'true';
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      testMode: isTestMode,
      activeChannel: isTestMode ? CHANNELS.test.name : CHANNELS.production.name,
      version: '1.0.0'
    });
  } catch (error) {
    return createErrorResponse('Health check failed', error.message);
  }
}

/**
 * Check YouTube live status using YouTube Data API v3
 */
async function checkYouTubeLiveStatus(channel, env) {
  const apiKey = env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Search for live broadcasts on the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `channelId=${channel.id}&` +
      `eventType=live&` +
      `type=video&` +
      `maxResults=1&` +
      `key=${apiKey}`;

    console.log(`🔍 Searching for live streams on ${channel.handle}`);
    
    const response = await fetch(searchUrl, {
      signal: AbortSignal.timeout(CONFIG.API_TIMEOUT)
    });
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const liveVideo = data.items[0];
      
      // Get additional video details
      const videoDetails = await getVideoDetails(liveVideo.id.videoId, apiKey);
      
      return {
        isLive: true,
        title: liveVideo.snippet.title,
        description: liveVideo.snippet.description,
        thumbnailUrl: liveVideo.snippet.thumbnails?.high?.url || liveVideo.snippet.thumbnails?.default?.url,
        videoId: liveVideo.id.videoId,
        channelTitle: liveVideo.snippet.channelTitle,
        startedAt: liveVideo.snippet.publishedAt,
        viewerCount: videoDetails?.viewerCount || 0,
        lastChecked: new Date().toISOString(),
        channel: {
          id: channel.id,
          handle: channel.handle,
          name: channel.name
        }
      };
    } else {
      return {
        isLive: false,
        lastChecked: new Date().toISOString(),
        channel: {
          id: channel.id,
          handle: channel.handle,
          name: channel.name
        }
      };
    }
    
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
}

/**
 * Get additional video details
 */
async function getVideoDetails(videoId, apiKey) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=liveStreamingDetails,statistics&` +
      `id=${videoId}&` +
      `key=${apiKey}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(CONFIG.API_TIMEOUT)
    });
    
    if (!response.ok) {
      console.warn('Failed to get video details:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        viewerCount: parseInt(video.liveStreamingDetails?.concurrentViewers || '0'),
        actualStartTime: video.liveStreamingDetails?.actualStartTime,
        statistics: video.statistics
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting video details:', error);
    return null;
  }
}

/**
 * Create success response with CORS headers
 */
function createSuccessResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': `public, max-age=${CONFIG.CACHE_TTL}`,
    },
  });
}

/**
 * Create error response with CORS headers
 */
function createErrorResponse(message, details = null) {
  const errorData = {
    error: message,
    details: details,
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(errorData), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 