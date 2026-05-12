/**
 * Intervalle contrôlé pour les animations de simulation.
 *
 * Le callback continue seulement si la simulation est active et si l'application
 * est au premier plan. Ça évite de faire tourner des calculs inutiles quand on
 * quitte l'écran ou que l'app passe en arrière-plan.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function utiliserIntervalleSimulation(enabled: boolean, callback: () => void, intervalMs: number) {
  const callbackRef = useRef(callback);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || appState !== 'active') {
      return;
    }

    const interval = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [appState, enabled, intervalMs]);
}
