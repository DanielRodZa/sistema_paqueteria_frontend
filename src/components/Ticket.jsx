import React from 'react';
import QRCode from "react-qr-code";
import logo from '../assets/logo.png'


import icon1 from '../assets/1.png'
import icon2 from '../assets/2.png'
import icon3 from '../assets/3.png'


const Ticket = React.forwardRef(({ operation, }, ref) => {
    if (!operation) return null;

    return (
        <div ref={ref} className="p-2 bg-white text-black font-sans w-full max-w-sm mx-auto overflow-hidden">
            {/* --- 1. Logo (Placeholder) y Dirección de Sucursal --- */}
            <div className="text-center mb-1">
                <div className="mx-auto flex items-center justify-center text-gray-500 mb-1">
                    <img src={logo} alt="Logo de la Empresa" className="h-32 w-auto mx-auto" />
                </div>
                <h2 className="text-lg font-bold leading-tight">Comprobante de Operación</h2>
                <p className="text-xs font-semibold text-black leading-tight">{operation.sucursal_origen_nombre}</p>
                <p className="text-[10px] text-gray-800 leading-tight">{operation.sucursal_origen.direccion}</p>
            </div>

            {/* --- 2. Folio y QR --- */}
            <div className="text-center my-1">
                <p className="font-semibold text-xs mb-0">FOLIO:</p>
                <p className="font-mono text-base tracking-wider font-bold leading-none">{operation.folio}</p>
                <div className="flex justify-center mt-1">
                    <QRCode value={operation.folio} size={84} />
                </div>
            </div>

            <div className="my-1 border-t border-b border-dashed py-1 text-xs space-y-0.5">
                {/* --- 3. Datos de la Operación --- */}
                <div className="flex justify-between items-center text-black">
                    <div className="flex items-center">
                        <img src={icon1} alt="Vendedor" className="h-3 w-3 mr-1" />
                        <span>Vendedor:</span>
                    </div>
                    <span className="font-semibold text-right truncate max-w-[150px]">{operation.vendedor_nombre}</span>
                </div>
                <div className="flex justify-between items-center text-black">
                    <div className="flex items-center">
                        <img src={icon2} alt="Comprador" className="h-3 w-3 mr-1" />
                        <span>Comprador:</span>
                    </div>
                    <span className="font-semibold text-right truncate max-w-[150px]">{operation.comprador}</span>
                </div>
                <div className="flex justify-between text-black"><span>Sucursal Destino:</span> <span className="font-semibold text-right">{operation.sucursal_destino_nombre}</span></div>
                <div className="flex justify-between text-black"><span>Tamaño:</span> <span className="font-semibold text-right">{operation.tamano_paquete}</span></div>
                <div className="flex justify-between">
                    <span>Tipo Entrega:</span>
                    <span className={`font-semibold ${operation.tipo_entrega === 'urgente' ? 'text-red-600 font-bold uppercase' : ''}`}>
                        {operation.tipo_entrega}
                    </span>
                </div>
            </div>

            <div className="my-1 border-b border-dashed py-1 text-xs space-y-0.5">
                {/* --- 4. Información de Pago --- */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={icon3} alt="Costo" className="h-3 w-3 mr-1" />
                        <span className="font-semibold">Costo del Servicio:</span>
                    </div>
                    <span className="font-bold text-base text-black">${parseFloat(operation.costo).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold">Estado del Pago:</span>
                    <span className={`font-bold text-sm ${operation.pagado ? 'text-green-600' : 'text-red-600'}`}>
                        {operation.pagado ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                </div>
            </div>

            <div className="text-center text-[10px] text-black mt-1 font-semibold leading-tight">
                {/* --- 5. Fechas --- */}
                <p>Expedición: {new Date(operation.fecha_creacion).toLocaleString()}</p>
                <p>Expiración: {operation.fecha_expiracion}</p>
                {operation.recibido_por_nombre && <p className="mt-0.5">Atendido por: {operation.recibido_por_nombre}</p>}
                <p className="mt-1 font-bold">Presentar folio para recoger.</p>
            </div>
        </div>
    );
});

export default Ticket;
