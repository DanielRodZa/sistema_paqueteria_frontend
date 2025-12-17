import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import Ticket from "./Ticket";
import Modal from "./Modal";
import VendedorForm from "./VendedorForm";
import QrScanner from "./QrScanner";


function NewOperationForm({ onSuccess }) {
    const [sucursales, setSucursales] = useState([]);
    const [configuracion, setConfiguracion] = useState(null);
    const [formData, setFormData] = useState({
        comprador: '',
        tamano: 'CH',
        peso: '',
        tipo_entrega: 'normal',
        sucursal_origen: '',
        sucursal_destino: '',
        pagado: false
    });

    // Estados para la lógica del Vendedor
    const [vendedorSearchId, setVendedorSearchId] = useState('');
    const [foundVendedor, setFoundVendedor] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

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

        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/configuracion/');
                console.log("Config fetched:", response.data); // DEBUG
                setConfiguracion(response.data);
            } catch (error) {
                console.error("Error fetching config", error);
            }
        };

        fetchSucursales();
        fetchConfig();
    }, []);

    useEffect(() => {
        const { sucursal_origen, sucursal_destino, tamano, tipo_entrega } = formData;

        console.log("Calc Debug:", { sucursal_origen, sucursal_destino, tamano, tipo_entrega, configuracion });

        // Use configuration if available, otherwise fallback to defaults (or wait)
        if (sucursal_origen && sucursal_destino && configuracion) {
            let base = sucursal_origen === sucursal_destino
                ? parseFloat(configuracion.costo_operacion_base)
                : parseFloat(configuracion.costo_envio_sucursal);

            console.log("Base cost:", base);

            if (tamano === 'XL') {
                base += parseFloat(configuracion.costo_extra_largo);
                console.log("Added XL cost:", configuracion.costo_extra_largo);
            }
            if (tipo_entrega === 'urgente') {
                base += parseFloat(configuracion.costo_urgente);
                console.log("Added Urgent cost:", configuracion.costo_urgente);
            }

            console.log("Final cost:", base);
            setCostoEstimado(base);
        } else if (sucursal_origen && sucursal_destino) {
            // Fallback logic if config is not yet loaded (optional, but good for UX)
            let base = sucursal_origen === sucursal_destino ? 10.00 : 20.00;
            if (tamano === 'XL') base += 50.00;
            if (tipo_entrega === 'urgente') base += 30.00;
            setCostoEstimado(base);
        }
    }, [formData.sucursal_origen, formData.sucursal_destino, formData.tamano, formData.tipo_entrega, configuracion]);

    const handleVendedorSearch = async (idToSearch) => {
        const id = idToSearch || vendedorSearchId;
        if (!id) return;
        try {
            const response = await apiClient.get(`/vendedores/${id.toUpperCase()}/`);
            setFoundVendedor(response.data);
            setVendedorSearchId(id.toUpperCase());
            setSearchError(false);
            setShowScanner(false);
        } catch (error) {
            setFoundVendedor(null);
            setSearchError(true);
            console.log(error);
        }
    };

    const handleScanSuccess = (decodedText) => {
        handleVendedorSearch(decodedText);
    };

    const handleNewVendedorSuccess = (nuevoVendedor) => {
        setFoundVendedor(nuevoVendedor);
        setVendedorSearchId(nuevoVendedor.id);
        setIsVendedorModalOpen(false);
        setSearchError(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        if (name === 'comprador') {
            finalValue = value.toUpperCase();
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foundVendedor) {
            alert("Debes buscar y seleccionar un vendedor válido antes de guardar.");
            return;
        }
        setIsSubmitting(true);
        if (!formData.sucursal_origen || !formData.sucursal_destino) {
            alert("Selecciona las sucursales de origen y destino.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                vendedor: foundVendedor.id,
                comprador: formData.comprador,
                tamano_paquete: formData.tamano,
                peso: formData.peso || 0, // Fallback to 0 if empty
                tipo_entrega: formData.tipo_entrega,
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
                            <>
                                <button type="button" onClick={() => handleVendedorSearch()} className="bg-blue-500 text-white p-2 rounded-md">Buscar</button>
                                <button type="button" onClick={() => setShowScanner(true)} className="bg-gray-700 text-white p-2 rounded-md">📷 QR</button>
                            </>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tamano" className="block text-sm font-medium text-gray-700">Tamaño</label>
                        <select id="tamano" name="tamano" value={formData.tamano} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="CH">Chico</option>
                            <option value="M">Mediano</option>
                            <option value="G">Grande</option>
                            <option value="XL">Extra Largo</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="peso" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                        <input
                            type="number"
                            id="peso"
                            name="peso"
                            value={formData.peso}
                            onChange={handleChange}
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <span className="block text-sm font-medium text-gray-700">Tipo de Entrega</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="tipo_entrega"
                                value="normal"
                                checked={formData.tipo_entrega === 'normal'}
                                onChange={handleChange}
                                className="form-radio text-indigo-600"
                            />
                            <span className="ml-2">Normal</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="tipo_entrega"
                                value="urgente"
                                checked={formData.tipo_entrega === 'urgente'}
                                onChange={handleChange}
                                className="form-radio text-red-600"
                            />
                            <span className="ml-2 text-red-600 font-medium">Urgente</span>
                        </label>
                    </div>
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

                <div className="flex flex-col items-end pt-2">
                    {!foundVendedor && vendedorSearchId && (
                        <p className="text-sm text-amber-600 mb-2">⚠️ Haz clic en "Buscar" para verificar el vendedor.</p>
                    )}
                    <button type="submit" disabled={isSubmitting || !foundVendedor} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Guardando...' : 'Guardar Operación'}
                    </button>
                </div>
            </form>

            <Modal isOpen={isVendedorModalOpen} onClose={() => setIsVendedorModalOpen(false)} title="Registrar Nuevo Vendedor">
                <VendedorForm onSuccess={handleNewVendedorSuccess} />
            </Modal>

            <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Escanear Código QR">
                <QrScanner onScanSuccess={handleScanSuccess} />
            </Modal>
        </>
    );
}

export default NewOperationForm;