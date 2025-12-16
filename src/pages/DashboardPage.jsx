import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import useDebounce from '../hooks/useDebounce';
import logo from '../assets/logo.png'

// Componentes
import Modal from '../components/Modal';
import NewOperationForm from '../components/NewOperationForm';
import StatusUpdater from '../components/StatusUpdater';
import SearchResult from '../components/SearchResult';
import QrScanner from '../components/QrScanner';
import Ticket from '../components/Ticket';
import RecepcionistaForm from '../components/RecepcionistaForm';

function DashboardPage() {
    const { user, logout } = useAuth();
    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(null);

    // Estados para modales
    const [isNewOperationModalOpen, setIsNewOperationModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    // Estados para búsqueda de folio
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Estados para filtros de la tabla
    const [filters, setFilters] = useState({
        vendedor__nombre__icontains: '',
        comprador__icontains: '',
        estado: '',
        start_date: '',
        end_date: ''
    });
    const debouncedFilters = useDebounce(filters, 500);

    const statusColors = {
        listo_para_entrega: 'bg-yellow-100 text-yellow-800',
        entregado: 'bg-green-100 text-green-800',
        cancelado: 'bg-red-100 text-red-800',
        en_resguardo: 'bg-gray-200 text-gray-800',
        en_transito: 'bg-blue-100 text-blue-800',
        expirado: 'bg-gray-400 text-white',
    };

    const fetchOperaciones = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Limpia los filtros vacíos antes de enviarlos
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });
            const response = await apiClient.get('/operaciones/', { params });
            setOperaciones(response.data);
            setListError(null);
        } catch (err) {
            setListError('No se pudieron cargar los datos de las operaciones.');
            console.error(err)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOperaciones(debouncedFilters);
    }, [debouncedFilters, fetchOperaciones]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearchLoading(true);
        setSearchResult(null);
        setSearchError(null);
        try {
            const response = await apiClient.get(`/operaciones/${searchTerm.trim()}/`);
            setSearchResult(response.data);
        } catch (error) {
            setSearchResult(null);
            if (error.response && error.response.status === 404) {
                setSearchError('Folio no encontrado.');
            } else {
                setSearchError('Error al buscar el folio.');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm && !searchLoading) {
            handleSearch({ preventDefault: () => { } });
        }
    }, [searchTerm]);

    const handleValidationScanSuccess = (decodedText) => {
        setIsScannerOpen(false);
        setSearchTerm(decodedText);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ vendedor__nombre__icontains: '', comprador__icontains: '', estado: '', fecha_creacion_after: '', fecha_creacion_before: '' });
    };

    const handleFormSuccess = () => {
        setIsNewOperationModalOpen(false);
        fetchOperaciones(filters);
    };

    const handleDelete = async (folio) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta operación?")) {
            try {
                await apiClient.delete(`/operaciones/${folio}/`);
                fetchOperaciones(filters);
            } catch (error) {
                alert("No se pudo eliminar la operación.");
                console.error(error);
            }
        }
    };

    const handleMarkAsPaid = async (folio) => {
        try {
            await apiClient.patch(`/operaciones/${folio}/`, { pagado: true });
            fetchOperaciones(filters);
        } catch (error) {
            alert("No se pudo actualizar el estado de pago.");
            console.error(error);
        }
    };

    const handleAddUserSuccess = () => {
        setIsAddUserModalOpen(false);
        alert('¡Recepcionista registrado con éxito!'); // O una notificación más elegante
    };

    const renderContent = () => {
        if (loading) return <p className="text-center text-gray-500">Cargando...</p>;
        if (listError) return <p className="text-center text-red-500">{listError}</p>;
        if (operaciones.length === 0) return <p className="text-center text-gray-500">No hay operaciones que coincidan.</p>;
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-2 px-4 text-left">Folio</th>
                            <th className="py-2 px-4 text-left">Vendedor</th>
                            <th className="py-2 px-4 text-left">Comprador</th>
                            <th className="py-2 px-4 text-left">Fecha Creación</th>
                            <th className="py-2 px-4 text-left">Fecha Expiración</th>
                            <th className="py-2 px-4 text-left">Estado</th>
                            <th className="py-2 px-4 text-left">Costo</th>
                            <th className="py-2 px-4 text-left">Pagado</th>
                            <th className="py-2 px-4 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {operaciones.map((op) => (
                            <tr key={op.folio} className="border-b hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedOperation(op)}>
                                <td className="py-2 px-4 font-mono text-sm whitespace-nowrap">{op.folio}</td>
                                <td className="py-2 px-4 whitespace-nowrap">{op.vendedor_nombre}</td>
                                <td className="py-2 px-4 whitespace-nowrap">{op.comprador}</td>
                                <td className="py-2 px-4 text-sm whitespace-nowrap">{op.fecha_creacion.substring(0, 10)}</td>
                                <td className="py-2 px-4 text-sm whitespace-nowrap">{op.fecha_expiracion}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusColors[op.estado] || 'bg-gray-200'}`}>
                                        {op.estado.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="py-2 px-4 font-semibold whitespace-nowrap">${parseFloat(op.costo).toFixed(2)}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                    {op.pagado ? <span className="text-green-600 font-bold">Sí</span> : <span className="text-red-600 font-bold">No</span>}
                                </td>
                                <td className="py-2 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center space-x-2">
                                        <StatusUpdater operation={op} onUpdate={() => fetchOperaciones(filters)} />
                                        {!op.pagado && user?.role !== 'RECEPCIONISTA' && (
                                            <button onClick={() => handleMarkAsPaid(op.folio)} className="text-green-500 hover:text-green-700 p-1" title="Marcar como Pagado">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.343-.196.574-.294a10.114 10.114 0 014.282 0c.23.098.416.191.574.294a.5.5 0 00.574-.838a11.083 11.083 0 00-5.432-1.58A11.083 11.083 0 004 6.58a.5.5 0 00.574.838c.158-.103.343-.196.574-.294zM4.773 9.418a.5.5 0 00-.574.838a11.083 11.083 0 005.432 1.58a11.083 11.083 0 005.432-1.58a.5.5 0 00-.574-.838a10.114 10.114 0 01-4.282 0a10.114 10.114 0 01-4.282 0zM10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>
                                            </button>
                                        )}
                                        {['ADMIN', 'MANAGER'].includes(user?.role) && (
                                            <button onClick={() => handleDelete(op.folio)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                        )}
                                        <button onClick={() => setSelectedOperation(op)} className="text-blue-500 hover:text-blue-700 p-1" title="Imprimir Ticket">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <div className="bg-gray-100 min-h-screen">
                <header className="bg-white shadow-sm no-print">
                    <div className="max-w-[95%] mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <img src={logo} alt="Logo" className="h-20 w-auto mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold leading-tight text-gray-900">Dashboard</h1>
                            {user && (
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>Usuario: {user.username} ({user.role})</span>
                                    {/* Debug indicator - subtle */}
                                    <span title={`Role Debug: ${user.role} (${typeof user.role})`} className="cursor-help text-xs text-gray-400 opacity-50 hover:opacity-100">
                                        ℹ️
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            {user?.role === 'ADMIN' && (
                                <>
                                    <Link to="/sucursales" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Sucursales</Link>
                                    <Link to="/users" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Gestionar Usuarios</Link>
                                    <Link to="/configuracion" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Configuración</Link>
                                </>
                            )}

                            {/* Manager and Admin links */}
                            {['ADMIN', 'MANAGER'].includes(user?.role) && (
                                <>
                                    <Link to="/reportes" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Reportes</Link>
                                    <Link to="/vendedores" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Vendedores</Link>
                                </>
                            )}

                            {/* Manager-only link */}
                            {user?.role === 'MANAGER' && (
                                <button onClick={() => setIsAddUserModalOpen(true)} className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                                    Añadir Recepcionista
                                </button>
                            )}
                            <button onClick={() => setIsNewOperationModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Nueva Operación</button>
                            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm">Cerrar Sesión</button>
                        </div>
                    </div>
                </header>

                <main className="py-8 max-w-[95%] mx-auto sm:px-6 lg:px-8 no-print">
                    <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-8">
                        <form onSubmit={handleSearch}>
                            <label htmlFor="search-folio" className="block text-sm font-medium text-gray-700">Validar Folio para Entrega</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 block w-full rounded-none rounded-l-md px-3 py-2 border border-gray-300" placeholder="Introduce o escanea el folio" />
                                <button type="button" onClick={() => setIsScannerOpen(true)} className="bg-blue-500 text-white p-2 border border-blue-500">Escanear</button>
                                <button type="submit" disabled={searchLoading} className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md">
                                    {searchLoading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </form>
                        {searchError && <p className="mt-2 text-sm text-red-600">{searchError}</p>}
                        {searchResult && <SearchResult operation={searchResult} onDeliveryConfirmed={() => { setSearchTerm(''); setSearchError(null); setSearchResult(null); fetchOperaciones(filters); }} />}
                    </div>

                    <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                            <div>
                                <label htmlFor="vendedor__nombre__icontains" className="block text-sm font-medium text-gray-700">Vendedor</label>
                                <input type="text" name="vendedor__nombre__icontains" value={filters.vendedor__nombre__icontains} onChange={handleFilterChange} className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="comprador__icontains" className="block text-sm font-medium text-gray-700">Comprador</label>
                                <input type="text" name="comprador__icontains" value={filters.comprador__icontains} onChange={handleFilterChange} className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                                <select name="estado" value={filters.estado} onChange={handleFilterChange} className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm">
                                    <option value="">Todos</option>
                                    <option value="listo_para_entrega">Listo para entrega</option>
                                    <option value="en_resguardo">En resguardo</option>
                                    <option value="en_transito">En Tránsito</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="expirado">Expirado</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fecha_creacion_after" className="block text-sm font-medium text-gray-700">Desde</label>
                                <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="fecha_creacion_before" className="block text-sm font-medium text-gray-700">Hasta</label>
                                <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <button onClick={clearFilters} className="w-full bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-4 rounded-md shadow-sm">Limpiar</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <Modal isOpen={isNewOperationModalOpen} onClose={() => setIsNewOperationModalOpen(false)} title="Nueva Operación">
                <NewOperationForm onSuccess={handleFormSuccess} />
            </Modal>
            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Escanear QR del Paquete">
                {isScannerOpen && <QrScanner onScanSuccess={handleValidationScanSuccess} />}
            </Modal>
            <Modal isOpen={!!selectedOperation} onClose={() => setSelectedOperation(null)} title="Detalles de la Operación">
                {selectedOperation && (
                    <div>
                        <div className="printable-area">
                            <Ticket operation={selectedOperation} />
                        </div>
                        <div className="flex justify-end mt-6 no-print">
                            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Reimprimir Ticket
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Registrar Nuevo Recepcionista">
                <RecepcionistaForm onSuccess={handleAddUserSuccess} />
            </Modal>
        </>
    );
}

export default DashboardPage;