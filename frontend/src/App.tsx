import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getToken } from './services/authStore';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const token = getToken();

  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Redirecionamentos */}
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
