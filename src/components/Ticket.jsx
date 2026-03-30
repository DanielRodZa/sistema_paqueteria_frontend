import React from 'react';
import QRCode from "react-qr-code";
import logo from '../assets/logo.png'


import icon1 from '../assets/1.png'
import icon2 from '../assets/2.png'
import icon3 from '../assets/3.png'


const Ticket = React.forwardRef(({ operation, }, ref) => {
    if (!operation) return null;

    return (
        <div ref={ref} className="p-1 bg-white text-black font-sans w-[58mm] mx-auto overflow-hidden print:w-full print:p-0">
            {/* --- 1. Logo (Placeholder) y Dirección de Sucursal --- */}
            <div className="text-center mb-1">
                <div className="mx-auto flex items-center justify-center mb-1">
                    <img src={logo} alt="Logo de la Empresa" className="h-20 w-auto mx-auto" />
                </div>
                <h2 className="text-[14px] font-black leading-tight uppercase">Comprobante</h2>
                <p className="text-[12px] font-bold text-black leading-tight">{operation.sucursal_origen_nombre}</p>
                <p className="text-[10px] text-black leading-tight">{operation.sucursal_origen.direccion}</p>
            </div>

            {/* --- 2. Folio y QR --- */}
            <div className="text-center my-1">
                <p className="font-bold text-[10px] mb-0">FOLIO:</p>
                <p className="font-mono text-lg tracking-wider font-black leading-none">{operation.folio}</p>
                <div className="flex justify-center mt-1">
                    <QRCode value={operation.folio} size={100} />
                </div>
            </div>

            <div className="my-1 border-t border-b border-black border-dashed py-1 text-[11px] space-y-0.5">
                {/* --- 3. Datos de la Operación --- */}
                <div className="flex justify-between items-start text-black">
                    <div className="flex items-center font-bold">
                        <img src={icon1} alt="Vendedor" className="h-3 w-3 mr-1" />
                        <span>Vendedor:</span>
                    </div>
                    <span className="font-black text-right break-words max-w-[100px]">{operation.vendedor_nombre}</span>
                </div>
                <div className="flex justify-between items-start text-black">
                    <div className="flex items-center font-bold">
                        <img src={icon2} alt="Comprador" className="h-3 w-3 mr-1" />
                        <span>Comprador:</span>
                    </div>
                    <span className="font-black text-right break-words max-w-[100px]">{operation.comprador}</span>
                </div>
                <div className="flex justify-between text-black"><span className="font-bold">Sucursal Destino:</span> <span className="font-black text-right">{operation.sucursal_destino_nombre}</span></div>
                <div className="flex justify-between text-black"><span className="font-bold">Tamaño:</span> <span className="font-black text-right">{operation.tamano_paquete}</span></div>
                <div className="flex justify-between text-black">
                    <span className="font-bold">Tipo Entrega:</span>
                    <span className={`font-black uppercase`}>
                        {operation.tipo_entrega}
                    </span>
                </div>
            </div>

            <div className="my-1 border-b border-black border-dashed py-1 text-[11px] space-y-1">
                {/* --- 4. Información de Pago --- */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={icon3} alt="Costo" className="h-3 w-3 mr-1" />
                        <span className="font-bold">Costo del Servicio:</span>
                    </div>
                    <span className="font-black text-lg text-black">${parseFloat(operation.costo).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center mt-1 border-2 border-black p-1">
                    <span className="font-bold text-[10px] uppercase">Estado del Pago:</span>
                    <span className="font-black text-xl text-black">
                        {operation.pagado ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                </div>
            </div>

            <div className="text-center text-[10px] text-black mt-2 font-bold leading-tight uppercase">
                {/* --- 5. Fechas --- */}
                <p>Expedición: {new Date(operation.fecha_creacion).toLocaleString()}</p>
                <p>Expiración: {operation.fecha_expiracion}</p>
                {operation.recibido_por_nombre && <p className="mt-0.5">Atendido por: {operation.recibido_por_nombre}</p>}
                <p className="mt-2 text-[12px] font-black border-t border-black pt-1">Presentar folio para recoger.</p>
            </div>
        </div>
    );
});

export default Ticket;
