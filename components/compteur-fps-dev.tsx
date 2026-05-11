import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { donneesLocales } from '@/db/donnees-principales';

export function CompteurFpsDev() {
  const [fps, setFps] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const frameCountRef = useRef(0);
  const lastSampleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const statusStyle = fps >= 55 ? styles.good : fps >= 40 ? styles.warn : styles.bad;
  useEffect(() => {
    if (!__DEV__) {
      return;
    }


    let isMounted = true;

    function refreshEnabled() {
      void donneesLocales.init().then(() => {
        if (isMounted) {
          setEnabled(donneesLocales.obtenirParametres().fpsCounterEnabled);
        }
      });
    }

    refreshEnabled();
    const retirerEcouteurParametres = donneesLocales.ajouterEcouteurParametres(refreshEnabled);

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('evidex_settings_changed', refreshEnabled);
      return () => {
        isMounted = false;
        retirerEcouteurParametres();
        window.removeEventListener('evidex_settings_changed', refreshEnabled);
      };
    }

    return () => {
      isMounted = false;
      retirerEcouteurParametres();
    };
  }, []);
  useEffect(() => {
    if (!__DEV__ || !enabled) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      frameCountRef.current = 0;
      lastSampleRef.current = 0;
      setFps(0);
      return;
    }

    function tick(timestamp: number) {
      if (lastSampleRef.current === 0) {
        lastSampleRef.current = timestamp;
      }
      frameCountRef.current += 1;
      const elapsed = timestamp - lastSampleRef.current;
      if (elapsed >= 500) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastSampleRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);
  if (!__DEV__ || !enabled) {
    return null;
  }
  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={[styles.text, statusStyle]}>{fps || '--'} FPS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121A17',
    borderColor: '#50685C',
    borderRadius: 8,
    borderWidth: 1,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    top: 55,
    zIndex: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 14,
  },
  good: {
    color: '#7CCFBF',
  },
  warn: {
    color: '#D8A94A',
  },
  bad: {
    color: '#D97B6C',
  },
});
