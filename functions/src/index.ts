// functions/weekly-check.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: functions.config().youtube.apikey, // Access the YouTube API Key from environment variables
});

// Firebase Scheduled Function
exports.weeklyCheck = functions.pubsub.schedule('30 12 * * 0') // Every Sunday at 12:30 PM
  .timeZone('Europe/Budapest') // Set your timezone
  .onRun(async () => {
    try {
      // Access the YouTube channel ID from environment variables
      const channelId = functions.config().youtube.channelid;

      // Use the YouTube Data API to find the last live video
      const response = await youtube.search.list({
        channelId: channelId, // Use the channel ID from environment variables
        eventType: 'completed',
        maxResults: 1,
        order: 'date',
        part: 'id',
      });

      if (response.data.items.length > 0) {
        // Store the last live video ID in Firestore
        const lastLiveVideoId = response.data.items[0].id.videoId;
        const docRef = db.collection('lastLiveVideo').doc('videoId');

        // Update the Firestore document
        await docRef.set({ videoId: lastLiveVideoId });

        console.log('Last live video ID:', lastLiveVideoId);
      } else {
        console.log('No completed live videos found.');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    return null;
  });
