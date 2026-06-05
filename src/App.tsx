import { useState } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <>
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}
