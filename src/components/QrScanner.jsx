import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrScanner({ onScanSuccess }) {
    const scannerRef = useRef(null); // Use a ref to hold the scanner instance

    useEffect(() => {
        // Ensure the logic runs only once when the component mounts
        if (scannerRef.current) {
            return;
        }

        // Create a new scanner instance
        const scanner = new Html5QrcodeScanner(
            "qr-reader", // ID of the div to render into
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            false // verbose
        );

        // Define the success callback
        const success = (decodedText) => {
            // Ensure we have a scanner instance to clear
            if (scannerRef.current) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear scanner after success.", error);
                });
                onScanSuccess(decodedText);
            }
        };

        // Define the error callback (can be left empty)
        const error = (err) => {
            // This function is called frequently, so it's best to keep it quiet
        };

        // Start the scanner
        scanner.render(success, error);

        // Store the scanner instance in the ref
        scannerRef.current = scanner;

        // Define the cleanup function for when the component unmounts
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner on unmount.", error);
                });
            }
        };
    }, [onScanSuccess]); // The dependency array is correct

    return <div id="qr-reader" className="w-full"></div>;
}

export default QrScanner;