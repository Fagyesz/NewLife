import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Set up the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: functions.config().youtube.apikey, // Access the YouTube API Key from environment variables
});

// Define the test function
export const testFunction = functions.https.onRequest(async (req, res) => {
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

    if (response.data.items && response.data.items.length > 0) {
      // Store the last live video ID in Firestore
      const lastLiveVideoId = response.data.items[0].id!.videoId;
      const docRef = db.collection('lastLiveVideo').doc('videoId');

      // Update the Firestore document
      await docRef.set({ videoId: lastLiveVideoId });

      console.log('Last live video ID:', lastLiveVideoId);
    } else {
      console.log('No completed live videos found.');
    }

    return res.status(200).send('Test function executed successfully.');
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error occurred while executing the test function.');
  }
});
