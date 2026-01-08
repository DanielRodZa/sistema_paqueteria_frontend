import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

import Modal from "../components/Modal";
import RecepcionistaForm from "../components/RecepcionistaForm";

function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

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
        if (['ADMIN', 'MANAGER'].includes(currentUser?.role)) {
            fetchData();
        }
    }, [fetchData, currentUser]);

    const handleLocalChange = (userId, field, value) => {
        setUsers(prevUsers => prevUsers.map(u =>
            u.id === userId ? { ...u, [field]: value } : u
        ));
    };

    const handleSaveUser = async (user) => {
        try {
            await apiClient.patch(`/users/${user.id}/`, {
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                sucursal: user.sucursal
            });
            alert("Usuario actualizado correctamente.");
            fetchData(); // Optional: refresh to be sure
        } catch (error) {
            alert("Fallo al actualizar el usuario.");
            console.error(error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer (soft delete).")) {
            try {
                await apiClient.delete(`/users/${userId}/`);
                fetchData(); // Refresh list to see the user gone
            } catch (error) {
                alert("Error al eliminar usuario.");
                console.error(error);
            }
        }
    };

    if (!['ADMIN', 'MANAGER'].includes(currentUser?.role)) {
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
                    <div className="space-x-4">
                        <button
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            + Crear Nuevo Usuario
                        </button>
                        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Regresar al Dashboard
                        </Link>
                    </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            <input
                                                type="text"
                                                value={user.username}
                                                readOnly
                                                disabled
                                                className="border rounded p-1 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={user.first_name}
                                                    onChange={(e) => handleLocalChange(user.id, 'first_name', e.target.value)}
                                                    className="border rounded p-1 w-24"
                                                    placeholder="Nombre"
                                                />
                                                <input
                                                    type="text"
                                                    value={user.last_name}
                                                    onChange={(e) => handleLocalChange(user.id, 'last_name', e.target.value)}
                                                    className="border rounded p-1 w-24"
                                                    placeholder="Apellido"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleLocalChange(user.id, 'role', e.target.value)}
                                                disabled={user.role === 'ADMIN' || currentUser.role === 'MANAGER'}
                                                className="p-1 border rounded-md disabled:bg-gray-200"
                                            >
                                                <option value="ADMIN">Admin</option>
                                                <option value="MANAGER">Manager</option>
                                                <option value="RECEPCIONISTA">Recepcionista</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {currentUser.role === 'ADMIN' && user.role !== 'ADMIN' ? (
                                                <select
                                                    value={user.sucursal || ''}
                                                    onChange={(e) => handleLocalChange(user.id, 'sucursal', e.target.value)}
                                                    className="p-1 border rounded-md"
                                                >
                                                    <option value="">Not Assigned</option>
                                                    {sucursales.map(s => (
                                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                // Managers see the sucursal name (fixed)
                                                // Or if it's admin viewing admin
                                                <span className="text-gray-500">
                                                    {sucursales.find(s => s.id === user.sucursal)?.nombre || 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            {user.role !== 'ADMIN' && (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveUser(user)}
                                                        className="text-blue-600 hover:text-blue-900 font-bold"
                                                        title="Guardar cambios"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-red-600 hover:text-red-900 font-bold"
                                                        title="Eliminar usuario"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Crear Nuevo Usuario">
                <RecepcionistaForm onSuccess={(data) => {
                    setIsAddUserModalOpen(false);
                    fetchData();
                    if (data && data.username) {
                        alert(`Usuario creado exitosamente.\n\nNombre de Usuario: ${data.username}\n\nPor favor, copie este nombre de usuario.`);
                    } else {
                        alert("Usuario creado exitosamente.");
                    }
                }} />
            </Modal>
        </div>
    );
}

export default UserManagementPage;
