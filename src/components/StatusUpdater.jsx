import React, { useState } from 'react';
import apiClient from '../services/api';

// Objeto para mapear los valores internos a texto legible
const statusMap = {
    listo_para_entrega: 'Listo para entrega',
    en_resguardo: 'En resguardo',
    en_transito: 'En Tránsito',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
};

function StatusUpdater({ operation, onUpdate }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setIsUpdating(true);

        try {
            // Usamos PATCH para una actualización parcial
            await apiClient.patch(`/operaciones/${operation.folio}/`, {
                estado: newStatus,
            });
            onUpdate(); // Refresca la lista de operaciones en el Dashboard
        } catch (error) {
            console.error("Error updating status:", error);
            alert("No se pudo actualizar el estado.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <select
            value={operation.estado}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className={`p-1 border rounded-md text-sm ${isUpdating ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
        >
            {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>
                    {value}
                </option>
            ))}
        </select>
    );
}

export default StatusUpdater;