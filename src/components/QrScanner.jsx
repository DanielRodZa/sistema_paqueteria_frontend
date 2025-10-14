import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Usamos un temporizador para asegurarnos de que el DOM esté completamente listo
        const timeoutId = setTimeout(() => {
            // Solo inicializa el escáner si no existe ya una instancia
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader", // ID del div donde se renderizará
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false // verbose
                );

                const success = (decodedText) => {
                    // Detiene el escáner para evitar re-escaneos y llama a la función de éxito
                    if (scannerRef.current) {
                        scannerRef.current.clear().catch(error => {
                            console.error("Fallo al limpiar el escáner después del éxito.", error);
                        });
                        scannerRef.current = null; // Marca el escáner como limpiado
                        onScanSuccess(decodedText);
                    }
                };

                const error = (err) => {
                    // Ignora los errores comunes de "QR no encontrado" que ocurren en cada frame
                };

                scanner.render(success, error);
                scannerRef.current = scanner; // Guarda la instancia del escáner en la referencia
            }
        }, 100); // Un pequeño retraso de 100 milisegundos

        // Función de limpieza para detener la cámara si el componente se desmonta
        return () => {
            clearTimeout(timeoutId); // Limpia el temporizador si el componente se desmonta antes de que se ejecute
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Fallo al limpiar el escáner al desmontar.", error);
                });
            }
        };
    }, [onScanSuccess]);

    return <div id="qr-reader" className="w-full"></div>;
}

export default QrScanner;