import React from 'react';
import QRCode from "react-qr-code";
import logo from '../assets/logo.png'


import icon1 from '../assets/1.png'
import icon2 from '../assets/2.png'
import icon3 from '../assets/3.png'


const Ticket = React.forwardRef(({ operation, }, ref) => {
    if (!operation) return null;

    return (
        <div ref={ref} className="p-2 bg-white text-black font-sans w-[58mm] mx-auto overflow-hidden print:w-full">
            {/* --- 1. Logo (Placeholder) y Dirección de Sucursal --- */}
            <div className="text-center mb-2">
                <div className="mx-auto flex items-center justify-center mb-1">
                    <img src={logo} alt="Logo de la Empresa" className="h-24 w-auto mx-auto" />
                </div>
                <h2 className="text-[18px] font-black leading-tight uppercase">Comprobante</h2>
                <p className="text-[16px] font-bold text-black leading-tight">{operation.sucursal_origen_nombre}</p>
                <p className="text-[13px] text-black leading-tight">{operation.sucursal_origen.direccion}</p>
            </div>

            {/* --- 2. Folio y QR --- */}
            <div className="text-center my-2">
                <p className="font-bold text-[13px] mb-0">FOLIO:</p>
                <p className="font-mono text-[23px] tracking-wider font-black leading-none">{operation.folio}</p>
                <div className="flex justify-center mt-2">
                    <QRCode value={operation.folio} size={110} />
                </div>
            </div>

            <div className="my-2 border-t border-b border-black border-dashed py-1 text-[14px] space-y-0.5">
                {/* --- 3. Datos de la Operación --- */}
                <div className="flex justify-between items-start text-black">
                    <div className="flex items-center font-bold">
                        <img src={icon1} alt="Vendedor" className="h-4 w-4 mr-1" />
                        <span>Vendedor:</span>
                    </div>
                    <span className="font-black text-right break-words max-w-[120px]">{operation.vendedor_nombre}</span>
                </div>
                <div className="flex justify-between items-start text-black">
                    <div className="flex items-center font-bold">
                        <img src={icon2} alt="Comprador" className="h-4 w-4 mr-1" />
                        <span>Comprador:</span>
                    </div>
                    <span className="font-black text-right break-words max-w-[120px]">{operation.comprador}</span>
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

            <div className="my-2 border-b border-black border-dashed py-1 text-[14px] space-y-1">
                {/* --- 4. Información de Pago --- */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={icon3} alt="Costo" className="h-4 w-4 mr-1" />
                        <span className="font-bold">Costo del Servicio:</span>
                    </div>
                    <span className="font-black text-[23px] text-black">${parseFloat(operation.costo).toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center mt-1 border-2 border-black p-1">
                    <span className="font-bold text-[13px] uppercase">Estado del Pago:</span>
                    <span className="font-black text-[26px] text-black leading-tight">
                        {operation.pagado ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                </div>
            </div>

            <div className="text-center text-[13px] text-black mt-2 font-bold leading-tight uppercase">
                {/* --- 5. Fechas --- */}
                <p>Expedición: {new Date(operation.fecha_creacion).toLocaleString()}</p>
                <p>Expiración: {operation.fecha_expiracion}</p>
                {operation.recibido_por_nombre && <p className="mt-0.5">Atendido por: {operation.recibido_por_nombre}</p>}
                <p className="mt-2 text-[15px] font-black border-t border-black pt-1">Presentar folio para recoger.</p>
            </div>
        </div>
    );
});

export default Ticket;
