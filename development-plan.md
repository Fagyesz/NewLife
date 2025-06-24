# Új Élet Baptista Gyülekezet - Complete Development Plan

## Project Overview
- **Project name**:NewLife
- **Church**: Új Élet Baptista Gyülekezet (New Life Baptist Church)
- **Location**: Gyöngyös, Hungary
- **Members**: ~30
- **Tech Stack**: Angular 20 + Firebase
- **Language**: Hungarian
- **Budget**: Minimum cost (FREE Firebase tier)

## Core Features

### Public Features (No Login)
1. Homepage with church information
2. Live Stream Integration (YouTube/Facebook)
3. Events Calendar with "I'll be there" button
4. News and Announcements
5. About Us page
6. Contact Information

### Staff Features (Google Login)
7. Content Management System
8. Event Creation and Editing
9. Attendance Tracking Dashboard

### Admin Features (Admin Role)
10. Staff Management
11. Full System Administration

## Technical Architecture

### Frontend: Angular 20
- Zoneless change detection for performance
- Signal-based reactivity
- Material Design components
- Responsive design
- Hungarian language support

### Backend: Firebase
- Authentication (Google Sign-in)
- Firestore database
- Firebase Hosting
- Cloud Storage
- Security Rules

## Database Schema
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'service' | 'meeting' | 'special';
  location: string;
  createdBy: string;
}

interface AttendanceRecord {
  eventId: string;
  deviceId: string;
  timestamp: Date;
  confirmed: boolean;
}
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Angular 20 project setup
- [ ] Firebase project configuration
- [ ] Basic routing structure
- [ ] Authentication implementation
- [ ] Security rules setup

### Phase 2: Core Features (Week 3-4)
- [ ] Homepage design
- [ ] Events calendar
- [ ] News system
- [ ] YouTube integration
- [ ] Device fingerprinting
- [ ] Attendance tracking

### Phase 3: Staff Features (Week 5-6)
- [ ] Staff authentication
- [ ] Content management
- [ ] Event management
- [ ] Attendance dashboard

### Phase 4: Admin Features (Week 7)
- [ ] Admin dashboard
- [ ] Staff management
- [ ] System settings

### Phase 5: Polish & Deploy (Week 8)
- [ ] Design refinements
- [ ] Performance optimization
- [ ] Testing
- [ ] Production deployment

## Cost Analysis
Firebase Spark Plan (FREE):
- Firestore: 50K reads/day, 20K writes/day
- Hosting: 10GB storage, 10GB transfer/month
- Authentication: Unlimited
- Storage: 5GB

Estimated usage for 30 members stays well within limits.

## Implementation Details

### Project Setup
```bash
ng new uj-elet-baptista-app --routing --style=scss
npm install @angular/fire firebase
npm install @angular/material @angular/cdk
```

### Authentication Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    // Check if user is authorized staff/admin
  }
}
```

### Device Fingerprinting
```typescript
getDeviceId(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  return btoa(fingerprint).substring(0, 32);
}
```

## Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /attendance/{attendanceId} {
      allow create: if true; // Anyone can mark attendance
      allow read: if request.auth != null; // Staff can read
    }
  }
}
```

## Design System
- **Colors**: Baptist theme (main theme colours #399344 #429aca #eac338)
- **Typography**: Roboto (Hungarian support)
- **Animations**: Angular Animations API + AOS
- **Responsive**: Mobile-first design

## Hungarian Content Structure
- Főoldal (Home)
- Események (Events)
- Hírek (News)
- Élő közvetítés (Live Stream)
- Rólunk (About Us)
- Kapcsolat (Contact)

## Continuation Guide
When continuing in a new thread, reference:
- Current phase from timeline
- Completed tasks checklist
- Tech stack: Angular 20 + Firebase
- Key requirement: Hungarian Baptist church
- Budget: FREE tier Firebase
- Core feature: Device-based attendance tracking

## Success Metrics
- [ ] All events displayed correctly
- [ ] Attendance tracking works per device
- [ ] Staff can manage content
- [ ] Admin can manage staff
- [ ] Responsive on all devices
- [ ] Hungarian language throughout
- [ ] Stays within Firebase free limits

This plan provides a complete roadmap for the church website development with all necessary technical details and implementation guidance. 