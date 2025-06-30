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
    workerUrl: "https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev",
    fallbackUrl: "https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev"
  }
}; 