# Firebase Setup Instructions

🔒 **IMPORTANT**: This project uses Firebase and requires proper configuration to prevent API key exposure.

## Initial Setup

1. **Clone the repository**
2. **Copy template files and add your Firebase config:**

```bash
# Copy environment templates
cp src/environments/environment.template.ts src/environments/environment.ts
cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
cp .firebaserc.template .firebaserc
```

3. **Update the copied files with your Firebase project details:**
   - Get your Firebase config from: https://console.firebase.google.com/
   - Replace all `YOUR_*` placeholders with actual values
   - **NEVER commit these files to git!**

## Firebase Configuration

Replace these values in the environment files:
- `YOUR_API_KEY_HERE` - Your Firebase API key
- `YOUR_PROJECT_ID` - Your Firebase project ID  
- `YOUR_MESSAGING_SENDER_ID` - Your messaging sender ID
- `YOUR_APP_ID` - Your Firebase app ID
- `YOUR_MEASUREMENT_ID` - Your Analytics measurement ID

## Security Notes

⚠️ **The following files are ignored by git and should NEVER be committed:**
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `.firebaserc`
- `deploy-firebase.bat`

## Deployment

1. Make sure your environment files are properly configured
2. Run: `ng build --configuration=production`
3. Deploy: `firebase deploy --only hosting`

## Project Structure

- **Template files** (`.template.ts`) - Safe to commit, contain placeholders
- **Actual config files** - Ignored by git, contain real API keys
- **Deploy scripts** - Ignored by git for security 