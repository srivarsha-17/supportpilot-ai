/**
 * SupportPilot AI - Client API Service
 * 
 * Interacts with Express backend.
 * Uses VITE_API_BASE_URL (never exposes backend secrets).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Sends a customer support message to the backend pipeline.
 * 
 * @param {string} message - Customer inquiry text
 * @returns {Promise<object>} Pipeline response
 */
export async function sendSupportMessage(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error('[API] Error calling support endpoint:', err);
    throw err;
  }
}

/**
 * Fetches Knowledge Base metadata for sidebar status.
 * @returns {Promise<object>}
 */
export async function fetchKbMetadata() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kb`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('[API] Could not fetch KB metadata:', err.message);
    return null;
  }
}

/**
 * Checks backend health status.
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    return response.ok;
  } catch (err) {
    return false;
  }
}
