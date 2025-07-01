export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  },
  liveStream: {
    workerUrl: "https://status.bapti.hu/api/live",
    fallbackUrl: "https://status.bapti.hu/api/live",
    testModeUrl: "https://status.bapti.hu/api/test",
    healthUrl: "https://status.bapti.hu/api/health"
  },
  youtube: {
    mainChannelId: "UC3GbgMOUrfVnipHXvXQYFkA", // @ujeletbaptistagyulekezet
    testChannelId: "UCftu1qQJZjQKHIXAjhDvFkw", // @fagyi3970
    apiKey: "YOUR_YOUTUBE_API_KEY_HERE"
  }
}; 