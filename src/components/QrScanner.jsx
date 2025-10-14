import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    useEffect(() => {
        // Variable para mantener la instancia del escáner
        let scanner;

        // Función para renderizar el escáner
        const renderScanner = () => {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false // verbose
            );

            const success = (decodedText) => {
                // Detiene el escáner ANTES de hacer cualquier otra cosa
                // para evitar el bucle de re-escaneo.
                if (scanner) {
                    scanner.clear();
                }
                onScanSuccess(decodedText);
            };

            const error = (err) => {
                // No es necesario hacer nada con los errores de "QR no encontrado"
            };

            scanner.render(success, error);
        };

        // Renderiza el escáner solo si el div existe
        if (document.getElementById("qr-reader")) {
            renderScanner();
        }

        // Función de limpieza para detener la cámara cuando el componente se desmonte
        return () => {
            if (scanner) {
                scanner.clear().catch(error => {
                    console.warn("Advertencia de limpieza del escáner (Modo Desarrollo):", error);
                });
            }
        };
    }, [onScanSuccess]);

    return <div id="qr-reader" className="w-full"></div>;
}

export default QrScanner;