
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Configurator } from './pages/Configurator';
import { History } from './pages/History';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { UserProfile, UserRole } from './types';

// Simple Auth Context to manage state
interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: UserRole }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Caricamento...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking Firebase Auth Check
    const stored = localStorage.getItem('tbm_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Per il momento: validazione fissa su admin@tbm.it
    if (email === 'admin@tbm.it' && pass === 'admin@tbm.it') {
      const mockUser: UserProfile = {
        uid: 'admin-123',
        email,
        displayName: 'Amministratore',
        role: UserRole.ADMIN
      };
      localStorage.setItem('tbm_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      throw new Error("Credenziali non valide. Usa 'admin@tbm.it' per entrambi i campi.");
    }
  };

  const logout = () => {
    localStorage.removeItem('tbm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {user && <Navbar />}
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/configurator" element={<ProtectedRoute><Configurator /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role={UserRole.ADMIN}><AdminPanel /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
