import React, { useState } from 'react';
import apiClient from '../services/api';

function VendedorForm({ vendedor, onSuccess }) {
    // Inicializa el estado del formulario, usando los datos del vendedor si se está editando
    const [formData, setFormData] = useState({
        // id is read-only or auto-generated
        nombre: vendedor?.nombre || '',
        email: vendedor?.email || '',
        telefono: vendedor?.telefono || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'nombre') {
            finalValue = value.toUpperCase();
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (vendedor) {
                // Si se edita, se envía todo menos el 'id'
                const { id, ...payload } = formData;
                response = await apiClient.patch(`/vendedores/${vendedor.id}/`, payload);
            } else {
                // Si se crea, se envía todo el formulario, incluyendo el nuevo 'id'
                response = await apiClient.post('/vendedores/', formData);
            }
            onSuccess(response.data); // Devuelve el objeto del vendedor al componente padre
        } catch (error) {
            alert('Error al guardar. Asegúrate de que el código no esté repetido.');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">


            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del vendedor"
                    required
                    className="w-full p-2 border rounded-md"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico (Opcional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email del vendedor" className="w-full p-2 border rounded" />
            </div>
            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono de contacto" required className="w-full p-2 border rounded" />
            </div>

            <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
                Guardar
            </button>
        </form>
    );
}

export default VendedorForm;