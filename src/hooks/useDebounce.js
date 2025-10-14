import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
    // Estado para guardar el valor "debounced"
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Crea un temporizador que actualizará el valor debounced después del delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpia el temporizador si el valor cambia (ej. el usuario sigue escribiendo)
        // o si el componente se desmonta.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo se re-ejecuta si el valor o el delay cambian

    return debouncedValue;
}

export default useDebounce;