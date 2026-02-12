# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native e-commerce mobile app built with Expo SDK 54, React 19, and React Navigation 7 (stack navigator). Targets Android, iOS, and web platforms. Uses Expo's new architecture.

## Commands

```bash
npx expo start          # Start dev server
npx expo start --android  # Run on Android
npx expo start --ios      # Run on iOS
npx expo start --web      # Run on web
eas build --profile preview --platform android  # Build Android APK
eas build --profile production --platform android  # Production build
```

No test framework is configured.

## Architecture

### Provider Hierarchy (App.js)

```
SafeAreaProvider → AuthProvider → CartProvider → NavigationContainer → Stack.Navigator
```

All screens are wrapped in these providers. Auth must be above Cart because cart operations depend on authentication state.

### Navigation (Stack-only)

Single stack navigator in `App.js` with routes: Home, Products, ProductDetail, Checkout, Login, Profile, Categories, Offers, Contact, Orders. Several routes (Categories, Offers, Contact, Orders) point to PlaceholderScreen.

### State Management

Uses React Context + hooks (no Redux):

- **AuthContext** (`src/contexts/AuthContext.jsx`): Manages user/token with AsyncStorage persistence. Keys: `clientToken`, `client`. Exposes `login()`, `logout()`, `updateUser()` via `useAuth()` hook.
- **CartContext** (`src/contexts/CartContext.jsx`): Uses `useReducer` pattern. Hybrid persistence: tries API first, falls back to AsyncStorage. Actions: SET_CART, ADD_ITEM, UPDATE_ITEM, REMOVE_ITEM, CLEAR_CART, SET_LOADING, SET_ERROR. Access via `useCart()` hook.

### API Layer

- **`src/services/api.js`**: ApiService class using native `fetch()`. Base URL from `EXPO_PUBLIC_API_URL` env var. Auto-injects Bearer token from AsyncStorage. Endpoints for auth (`/login/tienda`, `/cliente`), products (`/publico/obtener_productos_shop`, `/publico/obtener_producto_slug/{slug}`), categories (`/publico/lista_categorias`), and orders.
- **`src/services/apiCart.js`**: Mock cart service with setTimeout delays, used as fallback when API fails.

### Design System

`src/styles/globalStyles.js` defines centralized colors, spacing (Tailwind-based scale), typography sizes, shadows, and border radii. Use `createStyle()` helper for StyleSheet creation.

## Key Conventions

- Authentication is required for cart operations and checkout; unauthenticated users are redirected to Login screen.
- Product images are constructed via `ApiService.getProductImageUrl(portada)`.
- Cart items use Spanish field names from the API: `precio` (price), `cantidad` (quantity), `imagen` (image), `variedadId` (variant).
- The API backend is at `https://joseluishidalgo.com/store/api` (set in `.env`).
- Custom `Header.jsx` component is used across all screens (cart badge + user icon).
