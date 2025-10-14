import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import Ticket from "./Ticket";
import Modal from "./Modal";
import VendedorForm from "./VendedorForm";


function NewOperationForm({ onSuccess }) {
    const [sucursales, setSucursales] = useState([]);
    const [formData, setFormData] = useState({
        comprador: '',
        tamano: 'CH',
        sucursal_origen: '',
        sucursal_destino: '',
        pagado: false
    });

    // Estados para la lógica del Vendedor
    const [vendedorSearchId, setVendedorSearchId] = useState('');
    const [foundVendedor, setFoundVendedor] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOperation, setCreatedOperation] = useState(null);
    const [costoEstimado, setCostoEstimado] = useState(10.00);

    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                const response = await apiClient.get('/sucursales/');
                setSucursales(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        sucursal_origen: response.data[0].id,
                        sucursal_destino: response.data[0].id,
                    }));
                }
            } catch (error) { console.error("No se pudieron cargar las sucursales", error); }
        };
        fetchSucursales();
    }, []);

    useEffect(() => {
        const { sucursal_origen, sucursal_destino } = formData;
        if (sucursal_origen && sucursal_destino) {
            setCostoEstimado(sucursal_origen === sucursal_destino ? 10.00 : 20.00);
        }
    }, [formData.sucursal_origen, formData.sucursal_destino]);

    const handleVendedorSearch = async () => {
        if (!vendedorSearchId) return;
        try {
            const response = await apiClient.get(`/vendedores/${vendedorSearchId.toUpperCase()}/`);
            setFoundVendedor(response.data);
            setSearchError(false);
        } catch (error) {
            setFoundVendedor(null);
            setSearchError(true);
            console.log(error);
        }
    };

    const handleNewVendedorSuccess = (nuevoVendedor) => {
        setFoundVendedor(nuevoVendedor);
        setVendedorSearchId(nuevoVendedor.id);
        setIsVendedorModalOpen(false);
        setSearchError(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foundVendedor) {
            alert("Debes buscar y seleccionar un vendedor válido antes de guardar.");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                vendedor: foundVendedor.id,
                comprador: formData.comprador,
                tamano_paquete: formData.tamano,
                sucursal_origen: formData.sucursal_origen,
                sucursal_destino: formData.sucursal_destino,
                pagado: formData.pagado
            };
            const response = await apiClient.post('/operaciones/', payload);
            setCreatedOperation(response.data);
        } catch (error) {
            setSubmitError('Ocurrió un error al crear la operación. Revisa los datos.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (createdOperation) {
        return (
            <div>
                <p className="text-center text-green-600 font-semibold mb-4">¡Operación creada con éxito!</p>


                <div className="printable-area">
                    <Ticket operation={createdOperation} />
                </div>

                <div className="flex justify-between items-center mt-6 space-x-4 no-print">
                    <button onClick={onSuccess} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        Cerrar
                    </button>

                    <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Imprimir Ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                <div>
                    <label htmlFor="vendedorSearchId" className="block text-sm font-medium text-gray-700">Código del Vendedor</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <input
                            type="text"
                            id="vendedorSearchId"
                            value={vendedorSearchId}
                            onChange={(e) => { setVendedorSearchId(e.target.value.toUpperCase()); setFoundVendedor(null); setSearchError(false); }}
                            placeholder="Introduce el código y busca"
                            className="block w-full px-3 py-2 border rounded-md"
                            disabled={!!foundVendedor}
                        />
                        {!foundVendedor ? (
                            <button type="button" onClick={handleVendedorSearch} className="bg-blue-500 text-white p-2 rounded-md">Buscar</button>
                        ) : (
                            <button type="button" onClick={() => { setFoundVendedor(null); setVendedorSearchId(''); }} className="bg-gray-500 text-white p-2 rounded-md">Cambiar</button>
                        )}
                    </div>

                    {foundVendedor && (
                        <div>
                            <label htmlFor="vendedorNombre" className="block text-sm font-medium text-gray-700">Nombre del Vendedor</label>
                            <input
                                type="text"
                                id="vendedorNombre"
                                value={foundVendedor.nombre}
                                readOnly
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="comprador" className="block text-sm font-medium text-gray-700">Nombre del Comprador</label>
                    <input
                        type="text"
                        id="comprador"
                        name="comprador"
                        value={formData.comprador}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sucursal_origen" className="block text-sm font-medium text-gray-700">Sucursal Origen</label>
                        <select id="sucursal_origen" name="sucursal_origen" value={formData.sucursal_origen} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md">
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sucursal_destino" className="block text-sm font-medium text-gray-700">Sucursal Destino</label>
                        <select id="sucursal_destino" name="sucursal_destino" value={formData.sucursal_destino} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md">
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="tamano" className="block text-sm font-medium text-gray-700">Tamaño del Paquete</label>
                    <select id="tamano" name="tamano" value={formData.tamano} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="CH">Chico</option>
                        <option value="M">Mediano</option>
                        <option value="G">Grande</option>
                    </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="text-sm text-gray-500">Costo del servicio:</p>
                        <p className="text-xl font-bold text-gray-800">${costoEstimado.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="pagado"
                            name="pagado"
                            type="checkbox"
                            checked={formData.pagado}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="pagado" className="ml-2 block text-sm font-medium text-gray-900">
                            Marcar como Pagado
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSubmitting || !foundVendedor} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Guardar Operación'}
                    </button>
                </div>
            </form>

            <Modal isOpen={isVendedorModalOpen} onClose={() => setIsVendedorModalOpen(false)} title="Registrar Nuevo Vendedor">
                <VendedorForm onSuccess={handleNewVendedorSuccess} />
            </Modal>
        </>
    );
}

export default NewOperationForm;