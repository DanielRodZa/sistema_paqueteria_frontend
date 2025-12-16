import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    const [error, setError] = useState(null);

    useEffect(() => {
        const scannerId = "qr-reader";
        const html5QrCode = new Html5Qrcode(scannerId);

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        // Success callback
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                            onScanSuccess(decodedText);
                        }).catch(err => {
                            console.error("Failed to stop scanner", err);
                            // Even if stop fails, try to proceed
                            onScanSuccess(decodedText);
                        });
                    },
                    (errorMessage) => {
                        // Error callback (scanning issues)
                        // console.log(errorMessage); // Optional: unexpected errors
                    }
                );
            } catch (err) {
                console.error("Error starting scanner:", err);
                setError("No se pudo acceder a la cámara. Verifique los permisos.");
            }
        };

        startScanner();

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Error stopping scanner on unmount", err));
            } else {
                html5QrCode.clear();
            }
        };
    }, []); // Removed dependency to prevent re-initialization

    return (
        <div className="w-full flex flex-col items-center">
            <div id="qr-reader" className="w-full max-w-sm"></div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Apunta la cámara al código QR del vendedor.</p>
        </div>
    );
}

export default QrScanner;