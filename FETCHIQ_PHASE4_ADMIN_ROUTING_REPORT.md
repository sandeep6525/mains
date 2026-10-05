# FetchIQ Admin Routing & Integration Report

## 1. Exact Files Changed
- `src/App.jsx`: Updated native routing to separate `/admin` paths and actively check `isAuthenticated` via `localStorage.getItem('fetchIqToken')`.
- `src/components/FetchIQ/Login.jsx`: Transformed into "FetchIQ Admin Login", directing successful logins to `/admin`.
- `src/components/FetchIQ/Dashboard.jsx`: Transformed into "FetchIQ Admin Dashboard", verifying auth tokens and exposing Admin features.
- `src/components/FetchIQ/Sources.jsx`: Created new component to fulfill Step 6 Source Management capabilities over the `/admin/sources` route.
- `src/components/FetchIQ/Ingestion.jsx`: Replaced back-navigation link to `/admin`.
- `src/components/FetchIQ/Review.jsx`: Replaced back-navigation link to `/admin`.
- `backend/routes/auth.js`: Extracted and exported the `authenticateToken` JWT middleware.
- `backend/routes/ingestion.js`: Applied the `authenticateToken` middleware globally to all ingestion/review/source APIs, explicitly ignoring the public `/pyqs` read endpoint.
- `backend/server.js`: Applied `authenticateToken` to the core `/api/fetchiq/dashboard` endpoint.

## 2. Authentication Flow
- Admin visits `/admin`.
- `App.jsx` evaluates `!isAuthenticated` and natively redirects `window.location.href` to `/admin/login`.
- Admin inputs credentials matching a `AdminUser` record. `POST /api/fetchiq/auth/login` issues a 1-day JWT.
- Frontend persists `fetchIqToken` to localStorage and redirects to `/admin`.
- On all `/admin/*` protected components, the React `useEffect` hooks construct `Authorization: Bearer <token>` headers on their API fetches.
- Backend routes invoke `jwt.verify(token, JWT_SECRET)` blocking unauthenticated access (401/403) to Source CRUD, Manual Uploads, Review, and Publishing.

## 3. Routing Flow (Native)
The existing Mains 360 App was architecturally reliant on `useState("studio")` tabs. To isolate the Admin workspace cleanly without installing `react-router-dom`:
```javascript
  const path = window.location.pathname.replace(/\/$/, '');
  
  if (path === '/admin/login') return <FetchIQLogin />;
  
  if (path === '/admin') {
     if (!isAuthenticated) return redirect;
     return <FetchIQDashboard />;
  }
  // (Source, Ingestion, Review, etc.)
  
  // Normal Mains 360 falls through:
  const [activeTab, setActiveTab] = useState("studio");
```
If a path matches `/admin...`, the root `App.jsx` intercepts rendering directly. Otherwise, it cleanly falls through to the existing native Mains 360 UI without disruption.

## 4. Test Results
1. **Open `/admin` while logged out:** Instantly redirected to `/admin/login`. **PASS**.
2. **Open `/admin/login`:** "FetchIQ Admin" login screen appears. **PASS**.
3. **Invalid Credentials:** Renders red "Invalid credentials" error from the backend. **PASS**.
4. **Valid Credentials:** LocalStorage token set, redirects to `/admin`. **PASS**.
5. **Authenticated `/admin`:** Displays "FetchIQ Admin Dashboard" with Manual PDF, Sources, and Pipeline stats. **PASS**.
6. **Open `/fetchiq/review/:id` logged out:** `App.jsx` logic intercepts and redirects to `/admin/login`. **PASS**.
7. **Logout:** Button correctly triggers `localStorage.removeItem('fetchIqToken')` and routes back to login. **PASS**.
8. **Relogin Required:** Tested `/admin` post-logout, properly blocked. **PASS**.
9. **Normal Mains 360 UI:** Tab components (Studio, Vault, Syllabus) still render successfully upon root `/` navigation. **PASS**.
10. **Backend Security:** Hitting `GET /api/fetchiq/ingestion/sources` directly via Postman without a Bearer token yields `401 Unauthorized`. **PASS**.

## 5. Limitations
- Native routing involves full page refreshes during navigation (`window.location.href`). However, since the Admin panel is distinct from the Mains 360 user interface, this effectively partitions the application memory safely.
- Token expiration (1 day) is not actively monitored by a frontend interval. When a token expires, the backend will return a 403, which prompts the `catch(err)` block of API calls to display an error state. The Admin must manually hit "Logout" or navigate to login to clear the stale token.
