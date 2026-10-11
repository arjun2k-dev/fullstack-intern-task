import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRoute from './components/GuestRoute';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Templates from './pages/Templates';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/templates" replace />} />
        <Route path="templates" element={<Templates />} />

        {/* Logged-in only: guests are redirected to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="favorites" element={<Favorites />} />
        </Route>

        {/* Guests only: logged-in users are redirected away */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
