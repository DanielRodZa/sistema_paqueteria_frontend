import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersResponse, sucursalesResponse] = await Promise.all([
                apiClient.get('/users/'),
                apiClient.get('/sucursales/')
            ]);
            setUsers(usersResponse.data);
            setSucursales(sucursalesResponse.data);
            setError(null);
        } catch (error) {
            setError("Error al cargar la información, debes ser administrador.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUserUpdate = async (userId, field, value) => {
        try {
            await apiClient.patch(`/users/${userId}/`, { [field]: value });
            fetchData();
        } catch (error) {
            alert("Fallo al actualizar el ususario.");
            console.error(error);
        }
    };

    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="p-8 text-center text-red-500">
                <p>No tienes los permisos para realizar esta acción.</p>
                <Link to="/" className="text-indigo-600">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Administración de usuarios</h1>
                    <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                        Regresar al Dashboard
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                    {loading && <p>Loading users...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre completo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            <input
                                                type="text"
                                                defaultValue={user.username}
                                                onBlur={(e) => handleUserUpdate(user.id, 'username', e.target.value)}
                                                className="border rounded p-1 w-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    defaultValue={user.first_name}
                                                    onBlur={(e) => handleUserUpdate(user.id, 'first_name', e.target.value)}
                                                    className="border rounded p-1 w-24"
                                                    placeholder="Nombre"
                                                />
                                                <input
                                                    type="text"
                                                    defaultValue={user.last_name}
                                                    onBlur={(e) => handleUserUpdate(user.id, 'last_name', e.target.value)}
                                                    className="border rounded p-1 w-24"
                                                    placeholder="Apellido"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUserUpdate(user.id, 'role', e.target.value)}
                                                disabled={user.role === 'ADMIN'} // Prevent changing other admins
                                                className="p-1 border rounded-md disabled:bg-gray-200"
                                            >
                                                <option value="ADMIN">Admin</option>
                                                <option value="MANAGER">Manager</option>
                                                <option value="RECEPCIONISTA">Recepcionista</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role !== 'ADMIN' ? (
                                                <select
                                                    value={user.sucursal || ''}
                                                    onChange={(e) => handleUserUpdate(user.id, 'sucursal', e.target.value)}
                                                    className="p-1 border rounded-md"
                                                >
                                                    <option value="">Not Assigned</option>
                                                    {sucursales.map(s => (
                                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagementPage;
