import React from 'react';
import QRCode from "react-qr-code";
import logo from '../assets/logo.png'


import icon1 from '../assets/1.png'
import icon2 from '../assets/2.png'
import icon3 from '../assets/3.png'


const Ticket = React.forwardRef(({ operation, }, ref) => {
    if (!operation) return null;

    return (
        <div ref={ref} className="p-6 bg-white text-black font-sans w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
            {/* --- 1. Logo (Placeholder) y Dirección de Sucursal --- */}
            <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center text-gray-500 mb-8">
                    <img src={logo} alt="Logo de la Empresa" className="h-20 w-auto mx-auto mb-2" />
                </div>
                <h2 className="text-xl font-bold">Comprobante de Operación</h2>
                <p className="text-xs text-gray-600 mt-1">{operation.sucursal_origen_nombre}</p>
                <p className="text-xs text-gray-500">{operation.sucursal_origen.direccion}</p>
            </div>

            {/* --- 2. Folio y QR --- */}
            <div className="text-center my-4">
                <p className="font-semibold">FOLIO:</p>
                <p className="font-mono text-lg tracking-wider">{operation.folio}</p>
                <div className="flex justify-center mt-2">
                    <QRCode value={operation.folio} size={128} />
                </div>
            </div>

            <div className="my-4 border-t border-b border-dashed py-2 text-sm">
                {/* --- 3. Datos de la Operación --- */}
                <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                        <img src={icon1} alt="Vendedor" className="h-4 w-4 mr-2" />
                        <span>Vendedor:</span>
                    </div>
                    <span className="font-semibold">{operation.vendedor_nombre}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                        <img src={icon2} alt="Comprador" className="h-4 w-4 mr-2" />
                        <span>Comprador:</span>
                    </div>
                    <span className="font-semibold">{operation.comprador}</span>
                </div>
                <div className="flex justify-between py-1"><span>Sucursal Destino:</span> <span className="font-semibold">{operation.sucursal_destino_nombre}</span></div>
                <div className="flex justify-between py-1"><span>Tamaño:</span> <span className="font-semibold">{operation.tamano_paquete}</span></div>
                <div className="flex justify-between py-1">
                    <span>Tipo Entrega:</span>
                    <span className={`font-semibold ${operation.tipo_entrega === 'urgente' ? 'text-red-600 font-bold uppercase' : ''}`}>
                        {operation.tipo_entrega}
                    </span>
                </div>
            </div>

            <div className="my-4 border-b border-dashed py-2 text-sm">
                {/* --- 4. Información de Pago --- */}
                <div className="flex justify-between items-center py-1">
                    <div className="flex items-center">
                        <img src={icon3} alt="Costo" className="h-4 w-4 mr-2" />
                        <span>Costo del Servicio:</span>
                    </div>
                    <span className="font-bold text-lg">${parseFloat(operation.costo).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span>Estado del Pago:</span>
                    <span className={`font-bold ${operation.pagado ? 'text-green-600' : 'text-red-600'}`}>
                        {operation.pagado ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                </div>
            </div>

            <div className="text-center text-xs text-gray-600">
                {/* --- 5. Fechas --- */}
                <p>Fecha de Expedición: {new Date(operation.fecha_creacion).toLocaleString()}</p>
                <p>Fecha de Expiración: {operation.fecha_expiracion}</p>
                {operation.recibido_por_nombre && <p className="mt-1">Atendido por: {operation.recibido_por_nombre}</p>}
                <p className="mt-2 font-semibold">El comprador debe presentar este folio para recoger el paquete.</p>
            </div>
        </div>
    );
});

export default Ticket;
