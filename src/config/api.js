/**
 * AccessRide — Centralized API base URL
 *
 * In development:  uses http://localhost (default)
 * In production:   set VITE_API_BASE in your .env file
 *
 * Usage in any component:
 *   import API_BASE from "../../config/api";
 *   fetch(`${API_BASE}/UserDashboard/api/notifications.php`)
 */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost";

export default API_BASE;
