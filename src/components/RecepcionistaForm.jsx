import React, { useState } from "react";
import apiClient from "../services/api.js";


function RecepcionistaForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        telefono: '',
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await apiClient.post('/users/add-recepcionista/', formData);
            onSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.username?.[0] || 'Ocurrió un error. Revisa los datos.';
            setError(errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono (opcional)" className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white p-2 rounded-md disabled:opacity-50">
                    {isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
                </button>
            </div>
        </form>
    );
}

export default RecepcionistaForm;
