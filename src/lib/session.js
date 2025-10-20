// Session management utilities

const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const createSession = () => {
  const sessionData = {
    isAuthenticated: true,
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
};

export const getSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    clearSession();
    return null;
  }
};

export const isSessionValid = () => {
  const session = getSession();
  return session !== null && Date.now() < session.expiresAt;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSessionTimeLeft = () => {
  const session = getSession();
  if (!session) return 0;
  
  const timeLeft = session.expiresAt - Date.now();
  return Math.max(0, timeLeft);
};

export const formatTimeLeft = (milliseconds) => {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
