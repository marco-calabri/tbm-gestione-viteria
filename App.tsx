
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
  login: (username: string, pass: string) => Promise<void>;
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

  // Se l'utente è un USER semplice, non può accedere ad altre sezioni oltre al configuratore
  // Se prova ad andare sulla dashboard (/) o altrove, lo mandiamo al configuratore
  if (user.role === UserRole.USER && role === UserRole.ADMIN) return <Navigate to="/configurator" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tbm_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      const response = await fetch('./Database/Utenti.json');
      const utenti = await response.json();

      const foundUser = utenti.find((u: any) =>
        u.username.toLowerCase() === username.toLowerCase() && u.password === pass
      );

      if (foundUser) {
        const profile: UserProfile = {
          uid: foundUser.username.toLowerCase(),
          email: `${foundUser.username.toLowerCase()}@tbm.it`,
          displayName: foundUser.displayName,
          role: foundUser.role as UserRole
        };
        localStorage.setItem('tbm_user', JSON.stringify(profile));
        setUser(profile);
      } else {
        throw new Error("Credenziali non valide.");
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Errore durante il login.");
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
              <Route path="/login" element={user ? <Navigate to={user.role === UserRole.ADMIN ? "/" : "/configurator"} /> : <Login />} />
              <Route path="/" element={<ProtectedRoute role={UserRole.ADMIN}><Dashboard /></ProtectedRoute>} />
              <Route path="/configurator" element={<ProtectedRoute><Configurator /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute role={UserRole.ADMIN}><History /></ProtectedRoute>} />
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
