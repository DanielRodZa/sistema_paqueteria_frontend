import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="h-24 w-auto" />
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}

export default LoginPage;