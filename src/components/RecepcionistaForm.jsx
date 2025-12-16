import React, { useState } from "react";
import apiClient from "../services/api.js";


import { useAuth } from "../context/AuthContext";

function RecepcionistaForm({ onSuccess }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        password: '',
        first_name: '',
        last_name: '',
        telefono: '',
        role: 'RECEPCIONISTA',
        sucursal: ''
    });
    const [sucursales, setSucursales] = useState([]);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch branches if user is Admin
    React.useEffect(() => {
        if (user?.role === 'ADMIN' || user?.is_superuser) {
            const fetchSucursales = async () => {
                try {
                    const res = await apiClient.get('/sucursales/');
                    setSucursales(res.data);
                    // Default to first branch if available
                    if (res.data.length > 0) {
                        setFormData(prev => ({ ...prev, sucursal: res.data[0].id }));
                    }
                } catch (err) {
                    console.error("Error fetching branches", err);
                }
            };
            fetchSucursales();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            // Use the new generic endpoint
            const res = await apiClient.post('/users/create/', formData);
            onSuccess(res.data);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.username?.[0] || 'Ocurrió un error. Revisa los datos.';
            setError(errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {isAdmin && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                            <option value="RECEPCIONISTA">Recepcionista</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                    {formData.role !== 'ADMIN' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sucursal</label>
                            <select name="sucursal" value={formData.sucursal} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white">
                                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-md mb-4 text-sm text-blue-700">
                <p><strong>Nota:</strong> El nombre de usuario se generará automáticamente con el formato: <code>ROL-SUCURSAL-NOMBRE</code></p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono (opcional)" className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white p-2 rounded-md disabled:opacity-50 hover:bg-indigo-700">
                    {isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
                </button>
            </div>
        </form>
    );
}

export default RecepcionistaForm;
