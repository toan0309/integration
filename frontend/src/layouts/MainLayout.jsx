import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/sidebar.scss';
import '../styles/header.scss';
import '../styles/dashboard.scss';

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
