import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Safe Polling Hook with Backoff and Error Guards
 * @param {Function} fetchFn - Async function to fetch data
 * @param {number} interval - Polling interval in ms
 * @param {object} options - { maxRetries, backoffFactor, onStop }
 */
export const useSafePoll = (fetchFn, interval = 5000, options = {}) => {
    const { maxRetries = 2, backoffFactor = 2, onStop = () => { } } = options;
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(true);

    const timerRef = useRef(null);
    const retryCountRef = useRef(0);
    const currentIntervalRef = useRef(interval);

    const poll = useCallback(async () => {
        try {
            const result = await fetchFn();

            // Stop condition: result explicitly tells us to stop (e.g. 404 handled in fetchFn)
            if (result && result.stop) {
                setIsPolling(false);
                onStop(result.reason || 'Requested Stop');
                return;
            }

            setData(result);
            setError(null);
            retryCountRef.current = 0; // Reset retries on success
            currentIntervalRef.current = interval; // Reset interval

            if (isPolling) {
                timerRef.current = setTimeout(poll, currentIntervalRef.current);
            }
        } catch (err) {
            console.error('Polling Error:', err);
            setError(err);

            if (retryCountRef.current < maxRetries) {
                retryCountRef.current += 1;
                currentIntervalRef.current *= backoffFactor;
                console.log(`Retrying in ${currentIntervalRef.current}ms (Retry ${retryCountRef.current}/${maxRetries})`);
                timerRef.current = setTimeout(poll, currentIntervalRef.current);
            } else {
                setIsPolling(false);
                onStop('Max retries reached or network error');
            }
        }
    }, [fetchFn, interval, maxRetries, backoffFactor, isPolling, onStop]);

    useEffect(() => {
        if (isPolling) {
            poll();
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPolling, poll]);

    const restart = () => {
        retryCountRef.current = 0;
        currentIntervalRef.current = interval;
        setIsPolling(true);
    };

    const stop = () => setIsPolling(false);

    return { data, error, isPolling, restart, stop };
};
