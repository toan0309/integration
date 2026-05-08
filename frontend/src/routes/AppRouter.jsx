import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import MainLayout from '../layouts/MainLayout';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyCode from '../pages/auth/VerifyCode';
import Profile from '../pages/auth/Profile';
import ChangePassword from '../pages/auth/ChangePassword';

// Dashboard
import DashboardHome from '../pages/DashboardHome';

// Admin pages
import UserList from '../pages/admin/UserList';
import UserAdd from '../pages/admin/UserAdd';
import UserEdit from '../pages/admin/UserEdit';
import RoleList from '../pages/admin/RoleList';
import PermissionList from '../pages/admin/PermissionList';

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/auth/verify-code" element={<PublicRoute><VerifyCode /></PublicRoute>} />
      <Route path="/auth/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="auth/profile" element={<Profile />} />
        <Route path="auth/change-password" element={<ChangePassword />} />
        <Route path="admin/users" element={<PrivateRoute requiredRoles={['admin']}><UserList /></PrivateRoute>} />
        <Route path="admin/users/add" element={<PrivateRoute requiredRoles={['admin']}><UserAdd /></PrivateRoute>} />
        <Route path="admin/users/:id/edit" element={<PrivateRoute requiredRoles={['admin']}><UserEdit /></PrivateRoute>} />
        <Route path="admin/roles" element={<PrivateRoute requiredRoles={['admin']}><RoleList /></PrivateRoute>} />
        <Route path="admin/permissions" element={<PrivateRoute requiredRoles={['admin']}><PermissionList /></PrivateRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
