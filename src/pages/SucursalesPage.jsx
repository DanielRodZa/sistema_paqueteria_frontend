import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import aplClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import apiClient from "../services/api";


const SucursalForm = ({ sucursal, onSuccess }) => {
    const [formData, setFormData] = useState({
        id: sucursal?.id || '',
        nombre: sucursal?.nombre || '',
        direccion: sucursal?.direccion || '',
        telefono: sucursal?.telefono || '',
        email_contacto: sucursal?.email_contacto || '',
        horario: sucursal?.horario || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'nombre' ? value.toUpperCase() : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (sucursal) {
                const { id, ...payload } = formData;
                await apiClient.patch(`/sucursales/${sucursal.id}/`, payload);
            } else {
                await apiClient.post(`/sucursales/`, formData);
            }
            onSuccess();
        } catch (error) {
            alert('Error al guardar la sucursal. Asegúrate de que el nombre no esté repetido.')
            console.error("Error saving sucursal:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">Código de Sucursal (ej. MEX)</label>
                <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                    placeholder="Máximo 4 caracteres"
                    maxLength="4"
                    required
                    // Se deshabilita si estamos editando una sucursal existente
                    disabled={!!sucursal}
                    className="w-full p-2 border rounded disabled:bg-gray-200"
                />
            </div>
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre de la sucursal" required className="w-full p-2 border rounded" />
            </div>
            <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                <textarea name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" required className="w-full p-2 border rounded" />
            </div>
            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono (Opcional)" className="w-full p-2 border rounded" />
            </div>
            <div>
                <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                <input type="email" name="email_contacto" value={formData.email_contacto} onChange={handleChange} placeholder="Email de la sucursal" className="w-full p-2 border rounded" />
            </div>
            <div>
                <label htmlFor="horario" className="block text-sm font-medium text-gray-700">Horario</label>
                <input type="text" name="horario" value={formData.horario} onChange={handleChange} placeholder="Ej. L-V 9am - 6pm" className="w-full p-2 border rounded" />
            </div>
            <button type="submit" className="w-full mt-4 bg-indigo-600 text-white p-2 rounded">Guardar</button>
        </form>
    );
};

function SucursalesPage() {
    const { user } = useAuth();
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSucursal, setSelectedSucursal] = useState(null);

    const fetchSucursales = useCallback(async () => {
        try {
            const response = await aplClient.get('/sucursales/');
            setSucursales(response.data);
        } catch (error) {
            console.error("Error fetching sucursales:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchSucursales();
        }
    }, [fetchSucursales, user]);

    const handleDelete = async (sucursarId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
            try {
                await apiClient.delete(`/sucursales/${sucursarId}`);
                fetchSucursales();
            } catch (error) {
                alert("No se pudo eliminar la sucursal. Asegúrate de que no tenga empleados o clientes asociados.");
                console.error("Error deleting sucursal:", error);
            }
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-500">Acceso denegado.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Gestionar Sucursales</h1>
                    <div>
                        <button onClick={() => { setSelectedSucursal(null); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">
                            Añadir Sucursal
                        </button>
                        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Volver al Dashboard
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    {loading ? <p>Cargando...</p> : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sucursales.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{s.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{s.direccion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.email_contacto || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.horario || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => { setSelectedSucursal(s); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSucursal ? "Editar Sucursal" : "Nueva Sucursal"}>
                <SucursalForm sucursal={selectedSucursal} onSuccess={() => { setIsModalOpen(false); fetchSucursales(); }} />
            </Modal>
        </div>
    );
}

export default SucursalesPage;