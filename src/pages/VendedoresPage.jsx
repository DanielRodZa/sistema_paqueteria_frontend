import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import QRCode from 'react-qr-code';

// --- CORRECCIÓN: Importamos el formulario reutilizable ---
import VendedorForm from '../components/VendedorForm';

function VendedoresPage() {
    const { user } = useAuth();
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [selectedVendedor, setSelectedVendedor] = useState(null);

    const fetchVendedores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/vendedores/');
            setVendedores(response.data);
        } catch (error) {
            console.error("Error fetching vendedores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchVendedores();
        }
    }, [fetchVendedores, user]);

    const handleDelete = async (vendedorId) => {
        if (window.confirm("¿Estás seguro? Esta acción no se puede deshacer.")) {
            try {
                await apiClient.delete(`/vendedores/${vendedorId}/`);
                fetchVendedores();
            } catch (error) {
                alert("No se pudo eliminar el vendedor. Puede que tenga operaciones asociadas.");
            }
        }
    };

    if (!['ADMIN', 'MANAGER'].includes(user?.role)) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Acceso denegado. Esta sección es para administradores y managers.</p>
                <Link to="/" className="text-indigo-600">Volver al Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Gestionar Vendedores</h1>
                    <div>
                        <button onClick={() => { setSelectedVendedor(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">
                            Añadir Vendedor
                        </button>
                        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Volver al Dashboard
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendedores.map(v => (
                                <tr key={v.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{v.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{v.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.email || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.telefono || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setSelectedVendedor(v); setIsQrOpen(true); }} className="text-blue-600 hover:text-blue-900">Mostrar QR</button>
                                        <button onClick={() => { setSelectedVendedor(v); setIsFormOpen(true); }} className="text-indigo-600 hover:text-indigo-900 ml-4">Editar</button>
                                        <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedVendedor ? "Editar Vendedor" : "Nuevo Vendedor"}>
                <VendedorForm vendedor={selectedVendedor} onSuccess={(vendedorCreado) => { setIsFormOpen(false); fetchVendedores(); }} />
            </Modal>

            <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title={`QR de ${selectedVendedor?.nombre}`}>
                {selectedVendedor && (
                    <div className="flex flex-col items-center">
                        <div id="qr-code-container" className="p-4 bg-white">
                            <QRCode value={selectedVendedor.id} size={256} />
                        </div>
                        <button
                            onClick={() => {
                                const svg = document.querySelector('#qr-code-container svg');
                                const canvas = document.createElement("canvas");
                                const svgData = new XMLSerializer().serializeToString(svg);
                                const img = new Image();
                                img.onload = () => {
                                    canvas.width = svg.clientWidth + 40; // Add padding margin
                                    canvas.height = svg.clientHeight + 40;
                                    const ctx = canvas.getContext("2d");
                                    ctx.fillStyle = "white";
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx.drawImage(img, 20, 20); // Draw with padding
                                    const pngFile = canvas.toDataURL("image/png");
                                    const downloadLink = document.createElement("a");
                                    downloadLink.download = `QR_${selectedVendedor.nombre.replace(/\s+/g, '_')}.png`;
                                    downloadLink.href = pngFile;
                                    downloadLink.click();
                                };
                                img.src = "data:image/svg+xml;base64," + btoa(svgData);
                            }}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Descargar Imagen
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default VendedoresPage;