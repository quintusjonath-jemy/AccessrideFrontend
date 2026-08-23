import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "mapbox-gl/dist/mapbox-gl.css";
import './index.css'
import App from './App.jsx'

// Automatically clean legacy localStorage keys from other apps or old sessions
try {
  const legacyKeys = [
    "admin_id", "admin_email", "admin_name",
    "user_id", "driver_id", "driverOnlineStatus",
    "dg_db_goals", "dg_db_plans", "dg_db_tasks", "dg_db_users", "dg_user"
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
} catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
