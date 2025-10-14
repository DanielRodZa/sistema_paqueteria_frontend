import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const statusMap = {
    listo_para_entrega: 'Listo para entrega',
    en_resguardo: 'En resguardo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
};

function SearchResult({ operation, onDeliveryConfirmed }) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [currentOperation, setCurrentOperation] = useState(operation);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setCurrentOperation(operation);
    }, [operation]);

    const handlePayNow = async () => {
        setIsProcessing(true);
        try {
            const response = await apiClient.patch(`/operaciones/${currentOperation.folio}/`, {
                pagado: true,
            });
            setCurrentOperation(response.data); // Actualiza el estado local con la respuesta de la API
            onDeliveryConfirmed(); // Llama a la función del padre para refrescar la tabla principal
        } catch (error) {
            alert('Error al procesar el pago.');
            console.error('Failed to pay now', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelivery = async () => {
        setIsConfirming(true);
        try {
            await apiClient.patch(`/operaciones/${operation.folio}/`, {
                estado: 'entregado',
            });
            onDeliveryConfirmed(); // Llama a la función para refrescar y limpiar
        } catch (error) {
            console.error('Failed to confirm delivery', error);
            alert('Error al confirmar la entrega.');
        } finally {
            setIsConfirming(false);
        }
    };

    if (operation.estado === 'entregado') {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-l-4 border-green-500">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {/* Icono de Check */}
                        <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-800">Paquete ya Entregado</h3>
                        <p className="text-sm text-gray-600">
                            Esta operación fue completada el: {new Date(operation.fecha_actualizacion).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="mt-4 text-sm">
                    <p><span className="font-semibold">Folio:</span> <span className="font-mono">{operation.folio}</span></p>
                    <p><span className="font-semibold">Entregado a:</span> {operation.comprador}</p>
                </div>
            </div>
        );
    }

    const canBeDelivered = currentOperation.estado === 'listo_para_entrega' && currentOperation.pagado;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resultado de la Búsqueda</h3>
            <div className="space-y-3">
                <p><span className="font-semibold">Folio:</span> <span className="font-mono">{operation.folio}</span></p>
                <p><span className="font-semibold">Vendedor:</span> {operation.vendedor}</p>
                <p><span className="font-semibold">Comprador:</span> {operation.comprador}</p>
                <p><span className="font-semibold">Estado:</span> <span className="font-bold capitalize">{statusMap[operation.estado]}</span></p>
            </div>

            <div className="mt-6 text-center">
                {canBeDelivered ? (
                    <button
                        onClick={handleConfirmDelivery}
                        disabled={isConfirming}
                        className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400"
                    >
                        {isConfirming ? 'Confirmando...' : 'Confirmar Entrega a Comprador'}
                    </button>
                ) : (
                    <>
                        {currentOperation.estado === 'listo_para_entrega' && !currentOperation.pagado ? (
                            <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md">
                                <p className="font-semibold">¡Pago Requerido!</p>
                                <p>Este paquete requiere el pago de ${parseFloat(currentOperation.costo).toFixed(2)} para ser liberado.</p>
                                {/* --- NUEVO: Botón para Pagar Ahora --- */}
                                <button onClick={handlePayNow} disabled={isProcessing} className="mt-2 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">
                                    {isProcessing ? 'Procesando Pago...' : 'Pagar Ahora'}
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md">
                                Este paquete no está listo para entrega. Estado actual: {statusMap[currentOperation.estado]}.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchResult;