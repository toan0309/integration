import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import NotificationToast from './components/NotificationToast';
import './styles/global.scss';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <NotificationToast />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
