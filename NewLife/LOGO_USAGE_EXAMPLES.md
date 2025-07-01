# Logo Usage Examples

This document shows how to use your church logos throughout the application.

## 🎯 Logo Components Available

### 1. Navigation Logo (Static with Fallback)
- **Location**: Navigation bar
- **Logo**: `logo.svg` → `csak-logo.png` (fallback)
- **Features**: Hover effects, responsive sizing
- **Auto-implemented**: Already working in navigation

### 2. Loading Spinner Component
- **Selector**: `<app-loading-spinner>`
- **Animated Logos**: 
  - `pulse` → `logo-animated-1.svg` (gentle pulsing)
  - `sway` → `logo-animated-2.svg` (swaying plant)
  - `static` → `logo.svg` (no animation)
- **Fallback**: `csak-logo.png`

### 3. Page Loader Component  
- **Selector**: `<app-page-loader>`
- **Logo**: `logo-animated-2.svg` (swaying animation)
- **Use**: Full-screen loading during route transitions
- **Fallback**: `csak-logo.png`

## 📝 Usage Examples

### Loading Spinner in Components

```typescript
// In your component.ts
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner';

@Component({
  imports: [LoadingSpinnerComponent, ...other imports],
  // ...
})
export class YourComponent {
  isLoading = signal(false);
}
```

```html
<!-- In your template -->

<!-- Basic loading spinner -->
<app-loading-spinner 
  *ngIf="isLoading()"
  message="Betöltés...">
</app-loading-spinner>

<!-- With pulsing animation -->
<app-loading-spinner 
  *ngIf="isLoading()"
  message="Események betöltése..."
  animationType="pulse">
</app-loading-spinner>

<!-- With swaying animation -->
<app-loading-spinner 
  *ngIf="isLoading()"
  message="Hírek betöltése..."
  animationType="sway">
</app-loading-spinner>

<!-- As overlay (covers entire screen) -->
<app-loading-spinner 
  *ngIf="isLoading()"
  message="Adatok mentése..."
  [overlay]="true"
  animationType="pulse">
</app-loading-spinner>
```

### Page Loader for Route Transitions

```typescript
// In app.ts or route component
import { PageLoaderComponent } from './shared/components/page-loader';

@Component({
  imports: [PageLoaderComponent, ...other imports],
  // ...
})
export class App {
  isPageLoading = signal(false);
  
  ngOnInit() {
    // Show loader during navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isPageLoading.set(true);
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.isPageLoading.set(false);
        }, 500);
      }
    });
  }
}
```

```html
<!-- In app.html -->
<app-page-loader 
  [isVisible]="isPageLoading()"
  loadingText="Oldal betöltése...">
</app-page-loader>

<router-outlet></router-outlet>
```

### Auth/Login Loading States

```html
<!-- In login.html -->
<app-loading-spinner 
  *ngIf="authService.isLoading()"
  message="Bejelentkezés..."
  animationType="pulse"
  [overlay]="true">
</app-loading-spinner>
```

### Data Loading in Lists

```html
<!-- Events page -->
<div *ngIf="eventsLoading()">
  <app-loading-spinner 
    message="Események betöltése..."
    animationType="sway">
  </app-loading-spinner>
</div>

<div *ngIf="!eventsLoading() && events().length > 0">
  <!-- Events list -->
</div>
```

### Admin Panel Operations

```html
<!-- Admin operations -->
<app-loading-spinner 
  *ngIf="isSaving()"
  message="Mentés..."
  animationType="pulse">
</app-loading-spinner>

<app-loading-spinner 
  *ngIf="isDeleting()"
  message="Törlés..."
  animationType="static">
</app-loading-spinner>
```

## 🎨 Logo Animation Types

### `pulse` (logo-animated-1.svg)
- **Best for**: Data loading, general operations
- **Animation**: Gentle pulsing and brightness changes
- **Duration**: 2.5s cycle
- **Feel**: Calm, reassuring

### `sway` (logo-animated-2.svg)  
- **Best for**: Content loading, news/articles
- **Animation**: Swaying plant with growth effects
- **Duration**: 3-4s cycle  
- **Feel**: Dynamic, alive

### `static` (logo.svg)
- **Best for**: Quick operations, error states
- **Animation**: None (but with CSS hover effects)
- **Feel**: Professional, minimal

## 🛡️ Fallback Strategy

All logo components automatically fallback to `csak-logo.png` if SVG files fail to load:

1. **Primary**: SVG logos (animated or static)
2. **Fallback**: `csak-logo.png` (reliable PNG)
3. **Ultimate fallback**: Text-only display

## 🚀 Where to Use These Components

### ✅ Recommended Places:
- **Data fetching**: Events, news, user profiles
- **Authentication**: Login, signup, logout
- **Admin operations**: Save, delete, update
- **Route transitions**: Between major pages
- **Image uploads**: File processing
- **Form submissions**: Contact forms, admin forms

### ❌ Avoid Using For:
- **Very quick operations** (< 200ms)
- **Small UI updates** (button clicks, toggles)
- **Decorative purposes** (use static logo instead)

## 📱 Responsive Behavior

All components automatically adjust:
- **Desktop**: Full size logos (80-120px)
- **Tablet**: Medium size (60-90px)  
- **Mobile**: Compact size (50-70px)

## 🔧 Customization Options

```html
<!-- Customize loading spinner -->
<app-loading-spinner 
  message="Custom message"
  animationType="pulse"
  [overlay]="false">
</app-loading-spinner>

<!-- Customize page loader -->
<app-page-loader 
  [isVisible]="true"
  loadingText="Egyedi betöltési szöveg">
</app-page-loader>
```

The logo components now provide a cohesive, branded loading experience throughout your church website! 🎯 