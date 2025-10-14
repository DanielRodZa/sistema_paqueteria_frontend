import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import ReportesPage from './pages/ReportesPage';
import VendedoresPage from './pages/VendedoresPage';
import SucursalesPage from './pages/SucursalesPage';
import UserManagementPage from './pages/UserManagementPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reportes"
                        element={
                        <ProtectedRoute>
                            <ReportesPage />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedores"
                        element={
                        <ProtectedRoute>
                            <VendedoresPage />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sucursales"
                        element={<ProtectedRoute
                        >
                            <SucursalesPage />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={<ProtectedRoute>
                            <UserManagementPage />
                        </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;