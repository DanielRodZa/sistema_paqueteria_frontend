import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statusMap = {
    listo_para_entrega: 'Listo para Entrega',
    en_resguardo: 'En Resguardo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    expirado: 'Expirado',
};

function ReportesPage() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ date_after: '', date_before: '' });

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(filters);
                const response = await apiClient.get(`/operaciones/reportes/?${params.toString()}`);

                const chartData = response.data.conteo_por_estado.map(item => ({
                    name: statusMap[item.estado] || item.estado,
                    cantidad: item.count,
                }));
                setReportData({ ...response.data, chartData });
            } catch (error) {
                console.error("Error fetching reports:", error);
                setReportData(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center no-print">
                    <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={handlePrint} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Imprimir Reporte
                        </button>
                        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Volver al Dashboard
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow mb-8 flex items-center space-x-4 no-print">
                    <div>
                        <label htmlFor="date_after" className="text-sm font-medium text-gray-700">Desde</label>
                        <input type="date" name="date_after" value={filters.date_after} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="date_before" className="text-sm font-medium text-gray-700">Hasta</label>
                        <input type="date" name="date_before" value={filters.date_before} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                    </div>
                </div>

                {loading && <p className="text-center p-10 no-print">Cargando reporte...</p>}
                {!loading && !reportData && <p className="text-center p-10 text-red-500 no-print">No se pudieron cargar los datos del reporte.</p>}

                {!loading && reportData && (
                    <div className="printable-area space-y-8 p-6 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-600">Operaciones del periodo</h3>
                                <p className="text-4xl font-bold text-gray-800 mt-2">{reportData?.total_operaciones_periodo}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-600">Ingresos del periodo</h3>
                                <p className="text-4xl font-bold text-green-600 mt-2">${parseFloat(reportData.corte_de_caja).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Distribución de Paquetes por Estado (Periodo)</h3>
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart data={reportData.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip formatter={(value) => [value, 'Cantidad']} />
                                        <Legend />
                                        <Bar dataKey="cantidad" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-8 overflow-x-auto">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">Datos en Tabla</h4>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.chartData.map((item) => (
                                            <tr key={item.name}>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 font-bold">{item.cantidad}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {reportData.paquetes_expirados && reportData.paquetes_expirados.length > 0 && (
                            <div className="p-6 rounded-lg shadow-sm border bg-red-50 border-red-200">
                                <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Paquetes Expirados (Este Mes)</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-red-200">
                                        <thead className="bg-red-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Folio</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Vendedor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Fecha Expiración</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Costo Acumulado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-red-100">
                                            {reportData.paquetes_expirados.map((op) => (
                                                <tr key={op.folio}>
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{op.folio}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{op.vendedor_nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">{op.fecha_expiracion}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${parseFloat(op.costo).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportesPage;