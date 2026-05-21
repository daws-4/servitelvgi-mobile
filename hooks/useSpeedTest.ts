import NetInfo from '@react-native-community/netinfo';
import SpeedCheckerPlugin from '@speedchecker/react-native-plugin';
import * as Location from 'expo-location';
import { useState, useEffect, useRef } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface SpeedTestEvent {
  downloadSpeed?: string;
  uploadSpeed?: string;
  ping?: number;
  status?: string;
}

export const useSpeedTest = () => {
  const [results, setResults] = useState({
    download: '0',
    upload: '0',
    ping: '0',
    isp: 'Cargando...',
    status: 'Inactivo',
    coordinates: null as Coordinates | null,
    networkName: 'Desconocido',
    networkBand: 'Desconocido',
    error: null as string | null,
  });

  // Store final values for animation
  const finalValues = useRef({
    download: 0,
    upload: 0,
    ping: 0,
  });

  // Store network data in refs to ensure it persists and is available when test ends
  const networkDataRef = useRef({
    isp: 'Desconocido',
    networkName: 'Desconocido',
    networkBand: 'Desconocido',
    coordinates: null as Coordinates | null,
  });

  // Helper function to parse speed values (removes "Mbps" and formats)
  const parseSpeed = (speedStr: string | undefined | null): number => {
    if (!speedStr) return 0;
    const match = String(speedStr).match(/[\d.]+/);
    if (match) {
      return parseFloat(match[0]);
    }
    return 0;
  };

  // Helper function to parse ping values (removes "ms")
  const parsePing = (pingStr: string | number | undefined | null): number => {
    if (!pingStr) return 0;
    const match = String(pingStr).match(/[\d.]+/);
    if (match) {
      return parseFloat(match[0]);
    }
    return 0;
  };

  useEffect(() => {
    // Set up event listeners when component mounts
    const setupListeners = () => {
      try {
        // Add listener for test started - THIS IS WHERE ALL DATA COMES!
        const testStartedListener = SpeedCheckerPlugin.addTestStartedListener?.((event: any) => {
          // console.log('🚀 Test started - Full event:', JSON.stringify(event, null, 2));

          // Extract values from the event
          const downloadSpeed = parseSpeed(event.downloadSpeed);
          const uploadSpeed = parseSpeed(event.uploadSpeed);
          const currentSpeed = parseSpeed(event.currentSpeed); // Progressive speed during test
          const ping = parsePing(event.ping);

          const isTestFinished = event.status === 'Speed test finished';

          // console.log('📊 Parsed values:', { downloadSpeed, uploadSpeed, currentSpeed, ping, status: event.status });

          // Update state preserving previous values
          setResults((prev) => {
            const newState = {
              ...prev,
              // Only update download if we have a value > 0, otherwise keep previous
              download: downloadSpeed > 0 ? downloadSpeed.toFixed(2) : prev.download,
              // Only update upload if we have a value > 0, otherwise keep previous
              upload: uploadSpeed > 0 ? uploadSpeed.toFixed(2) : prev.upload,
              // Only update ping if we have a value > 0, otherwise keep previous
              ping: ping > 0 ? ping.toFixed(0) : prev.ping,
              // Update status based on event
              status: isTestFinished
                ? 'Finalizado'
                : event.status === 'Upload Test'
                  ? 'Probando Subida'
                  : event.status === 'Download Test'
                    ? 'Probando Descarga'
                    : 'En Proceso',
            };

            // If we have currentSpeed during a test, use it for the appropriate field
            if (currentSpeed > 0) {
              if (event.status === 'Upload Test') {
                newState.upload = currentSpeed.toFixed(2);
              } else if (event.status === 'Download Test') {
                newState.download = currentSpeed.toFixed(2);
              }
            }

            // IMPORTANT: When test finishes, include network data from ref
            if (isTestFinished) {
              console.log(
                '[SpeedTest] 🏁 Test finished via testStartedListener. Ref data:',
                JSON.stringify(networkDataRef.current, null, 2)
              );
              console.log('[SpeedTest] 📊 Previous state data:', {
                isp: prev.isp,
                networkName: prev.networkName,
                networkBand: prev.networkBand,
              });

              // Helper function to check if value is a default/loading value
              const isValidValue = (val: string | null | undefined): boolean => {
                return !!val && val !== 'Desconocido' && val !== 'Cargando...' && val !== 'N/A';
              };

              // Use ref value if valid, else preserve prev value if it's valid
              const refIsp = networkDataRef.current.isp;
              const refNetworkName = networkDataRef.current.networkName;
              const refNetworkBand = networkDataRef.current.networkBand;
              const refCoordinates = networkDataRef.current.coordinates;

              newState.isp = isValidValue(refIsp)
                ? refIsp
                : isValidValue(prev.isp)
                  ? prev.isp
                  : refIsp;
              newState.networkName = isValidValue(refNetworkName)
                ? refNetworkName
                : isValidValue(prev.networkName)
                  ? prev.networkName
                  : refNetworkName;
              newState.networkBand = isValidValue(refNetworkBand)
                ? refNetworkBand
                : isValidValue(prev.networkBand)
                  ? prev.networkBand
                  : refNetworkBand;
              newState.coordinates = refCoordinates || prev.coordinates;

              console.log(
                '[SpeedTest] 🎯 Final state with network data:',
                JSON.stringify(newState, null, 2)
              );
            }

            return newState;
          });
        });

        // Keep these listeners for progressive updates if they fire
        const downloadListener = SpeedCheckerPlugin.addDownloadProgressListener?.((event: any) => {
          // console.log('📥 Download progress event:', event);

          const speed =
            event?.downloadSpeed ||
            event?.speed ||
            event?.data?.downloadSpeed ||
            event?.data?.speed;

          if (speed !== undefined && speed !== null) {
            const speedNum = parseSpeed(speed);
            // console.log('✅ UPDATING DOWNLOAD:', speedNum);

            setResults((prev) => ({
              ...prev,
              download: speedNum.toFixed(2),
              status: 'Probando Descarga',
            }));
          }
        });

        const uploadListener = SpeedCheckerPlugin.addUploadProgressListener?.((event: any) => {
          // console.log('📤 Upload progress event:', event);

          const speed =
            event?.uploadSpeed || event?.speed || event?.data?.uploadSpeed || event?.data?.speed;

          if (speed !== undefined && speed !== null) {
            const speedNum = parseSpeed(speed);
            // console.log('✅ UPDATING UPLOAD:', speedNum);

            setResults((prev) => ({
              ...prev,
              upload: speedNum.toFixed(2),
              status: 'Probando Subida',
            }));
          }
        });

        const pingListener = SpeedCheckerPlugin.addPingListener?.((event: any) => {
          // console.log('🏓 Ping event:', event);

          const ping = event?.ping || event?.latency || event?.data?.ping || event?.data?.latency;

          if (ping !== undefined && ping !== null) {
            const pingNum = parsePing(ping);
            // console.log('✅ UPDATING PING:', pingNum);

            setResults((prev) => ({
              ...prev,
              ping: pingNum.toFixed(0),
            }));
          }
        });

        const finishListener = SpeedCheckerPlugin.addTestFinishedListener?.((event: any) => {
          console.log('[SpeedTest] 🏁 Test finished event received');

          const downloadSpeed = parseSpeed(event?.downloadSpeed || event?.data?.downloadSpeed);
          const uploadSpeed = parseSpeed(event?.uploadSpeed || event?.data?.uploadSpeed);
          const ping = parsePing(event?.ping || event?.data?.ping);

          console.log('[SpeedTest] ✅ Final values:', { downloadSpeed, uploadSpeed, ping });
          console.log(
            '[SpeedTest] 📡 Network data from ref:',
            JSON.stringify(networkDataRef.current, null, 2)
          );

          // Include network data from ref to ensure it persists
          setResults((prev) => {
            const newState = {
              ...prev,
              download: downloadSpeed > 0 ? downloadSpeed.toFixed(2) : prev.download,
              upload: uploadSpeed > 0 ? uploadSpeed.toFixed(2) : prev.upload,
              ping: ping > 0 ? ping.toFixed(0) : prev.ping,
              status: 'Finalizado',
              // Ensure network data is included from ref (in case state wasn't updated in time)
              isp: networkDataRef.current.isp || prev.isp,
              networkName: networkDataRef.current.networkName || prev.networkName,
              networkBand: networkDataRef.current.networkBand || prev.networkBand,
              coordinates: networkDataRef.current.coordinates || prev.coordinates,
            };
            console.log('[SpeedTest] 🎯 Setting final state:', JSON.stringify(newState, null, 2));
            return newState;
          });
        });

        // console.log('🎧 SpeedChecker listeners registered:', {
        //   testStarted: !!testStartedListener,
        //   download: !!downloadListener,
        //   upload: !!uploadListener,
        //   ping: !!pingListener,
        //   finish: !!finishListener
        // });

        // Return cleanup function
        return () => {
          // console.log('🧹 Cleaning up SpeedChecker listeners...');
          testStartedListener?.remove?.();
          downloadListener?.remove?.();
          uploadListener?.remove?.();
          pingListener?.remove?.();
          finishListener?.remove?.();
        };
      } catch (error) {
        // console.error('❌ Error setting up SpeedChecker listeners:', error);
      }
    };

    const cleanup = setupListeners();
    return cleanup;
  }, []);

  const startTest = async () => {
    // Reset state before starting new test
    setResults({
      download: '0',
      upload: '0',
      ping: '0',
      isp: 'Cargando...',
      status: 'Preparando...',
      coordinates: null,
      networkName: 'Detectando...',
      networkBand: 'Detectando...',
      error: null,
    });

    finalValues.current = {
      download: 0,
      upload: 0,
      ping: 0,
    };

    // Check network connectivity first
    try {
      const netInfoState = await NetInfo.fetch();

      // Check if we have internet connection
      if (!netInfoState.isConnected || !netInfoState.isInternetReachable) {
        setResults((prev) => ({
          ...prev,
          status: 'Sin Conexión',
          error: 'No hay conexión a internet. Por favor verifica tu conexión y vuelve a intentar.',
          networkName: 'Sin conexión',
          networkBand: 'N/A',
          isp: 'Sin conexión',
        }));
        return; // Exit early - no point continuing without internet
      }

      // Get WiFi info
      console.log('[SpeedTest] NetInfo state:', JSON.stringify(netInfoState, null, 2));

      if (netInfoState.type === 'wifi' && netInfoState.details) {
        const wifiDetails = netInfoState.details as any;
        const ssid = wifiDetails.ssid || 'Red WiFi';

        console.log('[SpeedTest] WiFi Details:', JSON.stringify(wifiDetails, null, 2));
        console.log('[SpeedTest] SSID:', ssid);

        let band = 'Desconocido';
        if (wifiDetails.frequency) {
          const frequency = parseInt(wifiDetails.frequency);
          console.log('[SpeedTest] Frequency:', frequency);
          if (frequency >= 2400 && frequency <= 2500) {
            band = '2.4 GHz';
          } else if (frequency >= 5000 && frequency <= 5900) {
            band = '5 GHz';
          }
        }

        // Store in ref for persistence
        networkDataRef.current.networkName = ssid;
        networkDataRef.current.networkBand = band;
        console.log('[SpeedTest] Stored in ref:', networkDataRef.current);

        setResults((prev) => ({
          ...prev,
          networkName: ssid,
          networkBand: band,
          error: null,
        }));
      } else if (netInfoState.type === 'cellular') {
        const cellBand = netInfoState.details?.cellularGeneration || 'Desconocido';
        console.log('[SpeedTest] Cellular connection:', cellBand);

        // Store in ref for persistence
        networkDataRef.current.networkName = 'Datos Móviles';
        networkDataRef.current.networkBand = cellBand;

        setResults((prev) => ({
          ...prev,
          networkName: 'Datos Móviles',
          networkBand: cellBand,
          error: null,
        }));
      } else {
        console.log('[SpeedTest] Unknown network type:', netInfoState.type);
        setResults((prev) => ({
          ...prev,
          networkName: 'Desconocido',
          networkBand: 'Desconocido',
          error: null,
        }));
      }
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        networkName: 'Error de red',
        networkBand: 'Error',
        error: 'Error al detectar la red. Por favor verifica tu conexión.',
      }));
      // Continue anyway - might still work
    }

    // 1. Obtener coordenadas (non-critical - continue even if fails)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Store in ref for persistence
        networkDataRef.current.coordinates = coords;

        setResults((prev) => ({
          ...prev,
          coordinates: coords,
        }));
      }
    } catch (e) {
      // Location is optional - don't fail the test
    }

    // 2. Obtener el ISP using free API (non-critical)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://ip-api.com/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ispName = data.isp || 'Desconocido';
        console.log('[SpeedTest] ISP API Response:', ispName);

        // Store in ref for persistence
        networkDataRef.current.isp = ispName;

        setResults((prev) => ({ ...prev, isp: ispName }));
      } else {
        console.log('[SpeedTest] ISP API failed with status:', response.status);
        networkDataRef.current.isp = 'Desconocido';
        setResults((prev) => ({ ...prev, isp: 'Desconocido' }));
      }
    } catch (e) {
      console.log('[SpeedTest] ISP fetch error:', e);
      networkDataRef.current.isp = 'Desconocido';
      setResults((prev) => ({ ...prev, isp: 'Desconocido' }));
    }

    // Log final ref state before starting speed test
    console.log(
      '[SpeedTest] Final networkDataRef before starting test:',
      JSON.stringify(networkDataRef.current, null, 2)
    );

    // 3. Iniciar la prueba de velocidad (critical)
    try {
      // Final connectivity check before starting
      const finalCheck = await NetInfo.fetch();
      if (!finalCheck.isConnected) {
        setResults((prev) => ({
          ...prev,
          status: 'Sin Conexión',
          error: 'La conexión se perdió antes de iniciar la prueba.',
        }));
        return;
      }

      SpeedCheckerPlugin.startTest();
      setResults((prev) => ({ ...prev, status: 'Iniciando...', error: null }));
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al iniciar la prueba.';
      setResults((prev) => ({
        ...prev,
        status: 'Error',
        error: `No se pudo iniciar la prueba: ${errorMessage}`,
        isp: prev.isp === 'Cargando...' ? 'Error' : prev.isp,
      }));
    }
  };

  // Function to clear error
  const clearError = () => {
    setResults((prev) => ({ ...prev, error: null }));
  };

  return { results, startTest, clearError };
};
