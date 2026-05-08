import { useAuth } from '../context/AuthContext';

function NotificationToast() {
  const { notification } = useAuth();

  if (!notification) return null;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <div className="toast-container">
      <div className={`toast-item ${notification.type}`}>
        <span style={{ fontSize: '1.2rem' }}>{icons[notification.type]}</span>
        <div className="toast-content">
          <strong>{notification.title}</strong>
          {notification.message && <span>{notification.message}</span>}
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;
