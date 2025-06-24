# Firebase Setup Guide - Új Élet Baptista Gyülekezet

Ez az útmutató segít beállítani a Firebase-t a gyülekezeti weboldalhoz.

## 🔧 **1. Firebase Projekt Létrehozása**

### Lépések:
1. Látogasson el a [Firebase Console](https://console.firebase.google.com/)-ra
2. Kattintson a **"Create a project"** gombra
3. Projekt név: `uj-elet-baptista`
4. Engedélyezze a Google Analytics-et (opcionális)
5. Hozza létre a projektet

## 🏗️ **2. Web App Hozzáadása**

### Lépések:
1. A Firebase projektben kattintson a **"</>"** ikonra (Add app)
2. App nickname: `Új Élet Baptista Gyülekezet`
3. **NE** engedélyezze a Firebase Hosting-ot (még)
4. Regisztrálja az alkalmazást
5. Másolja ki a konfiguráció objektumot

### Konfiguráció frissítése:
Frissítse a `src/environments/environment.ts` és `src/environments/environment.prod.ts` fájlokat:

```typescript
export const environment = {
  production: false, // true a production.ts-ben
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "uj-elet-baptista.firebaseapp.com",
    projectId: "uj-elet-baptista",
    storageBucket: "uj-elet-baptista.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## 🔐 **3. Authentication Beállítása**

### Google Sign-In engedélyezése:
1. Firebase Console → **Authentication** → **Sign-in method**
2. Engedélyezze a **Google** szolgáltatót
3. Project support email: `admin@ujeletbaptista.hu`
4. Mentse el

### Authorized domains:
- `localhost` (fejlesztéshez)
- `uj-elet-baptista.web.app` (hosting után)
- A saját domain (ha van)

## 💾 **4. Firestore Database Beállítása**

### Database létrehozása:
1. Firebase Console → **Firestore Database** → **Create database**
2. **Start in production mode** (biztonsági szabályokkal)
3. Válasszon ki egy location-t (europe-west3 Németország)

### Security Rules telepítése:
Másolja a `firestore.rules` fájl tartalmát a Firebase Console-ba:
1. **Firestore Database** → **Rules**
2. Cserélje le a szabályokat a projekt `firestore.rules` fájljából
3. **Publish** gombra kattintás

## 👤 **5. Jogosult Felhasználók Hozzáadása**

### Manuális hozzáadás (első alkalommal):
1. Regisztráljon Google-lal a weboldalon
2. Firestore Console → **users** collection
3. Keresse meg a saját user dokumentumát
4. Állítsa be:
   ```json
   {
     "isAuthorized": true,
     "role": "admin"
   }
   ```

### Automatikus hozzáadás (kódban):
Frissítse az `AuthService`-ben az `authorizedEmails` tömböt:

```typescript
private authorizedEmails = [
  'admin@ujeletbaptista.hu',
  'lelkesz@ujeletbaptista.hu',
  'staff@ujeletbaptista.hu',
  'sajat.email@gmail.com' // Saját email hozzáadása
];
```

## 🚀 **6. Tesztelés**

### Local fejlesztés:
```bash
ng serve
```

### Funkciók tesztelése:
1. ✅ Google bejelentkezés
2. ✅ Események létrehozása (admin felületen)
3. ✅ Részvétel jelzése (események oldalon)
4. ✅ Statisztikák megtekintése (admin felületen)

## 📊 **7. Firebase Quota és Costs**

### FREE Tier limitek:
- **Authentication**: 10K felhasználó/hó
- **Firestore**: 1GB tárhely, 50K olvasás/nap, 20K írás/nap
- **Hosting**: 10GB tárhely, 125GB/hó adatforgalom

### ~30 tagú gyülekezetre estimáció:
- **Havi becsült használat**: 
  - Olvasások: ~5,000/hó (EVENT: elég a FREE tier-hez)
  - Írások: ~500/hó (EVENT: elég a FREE tier-hez)
  - Tárhely: ~50MB (EVENT: elég a FREE tier-hez)

## 🔒 **8. Biztonsági Ajánlások**

### Firestore Rules:
- ✅ A rules fájl már tartalmazza a megfelelő biztonsági szabályokat
- ✅ Csak jogosult staff módosíthat eseményeket
- ✅ Attendance rekordok device-alapú védelemmel

### Authentication:
- ✅ Csak Google Authentication engedélyezett
- ✅ Authorized email lista kódban karbantartva
- ✅ Role-based access control implementálva

## 📱 **9. Optional: Mobile App Setup**

Ha később mobil alkalmazást is szeretne:
1. Firebase projekt → **Add app** → iOS/Android
2. Követi a platform-specifikus útmutatókat
3. Ugyanazokat a szolgáltatásokat használhatja

## 📞 **10. Support**

Problémák esetén:
- Firebase dokumentáció: https://firebase.google.com/docs
- Angular Fire dokumentáció: https://github.com/angular/angularfire
- Stack Overflow: `firebase` + `angular` tagek

---

**🎉 Gratulálunk! A Firebase integráció kész.**

Most már rendelkezik:
- ✅ Biztonságos hitelesítéssel
- ✅ Valós idejű adatbázissal  
- ✅ Eszköz-alapú részvétel követéssel
- ✅ Admin felülettel az események kezeléséhez
- ✅ Automatikus szinkronizációval minden eszközön 