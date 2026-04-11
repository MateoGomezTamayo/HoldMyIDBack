import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './RfidActivateModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function RfidActivateModal({ isOpen, onClose, carnet, token, onRfidUpdated }) {
  const [uid, setUid] = useState('');
  const [manualUid, setManualUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcSupported] = useState(() => 'NDEFReader' in window);
  const nfcAbortRef = useRef(null);
  const scanBufferRef = useRef('');
  const scanLastTsRef = useRef(0);
  const scanTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUid(carnet?.rfid_uid || '');
      setManualUid('');
      setError('');
      setSuccess('');
      setLoading(false);
      setNfcScanning(false);
    } else {
      if (nfcAbortRef.current) {
        nfcAbortRef.current.abort();
        nfcAbortRef.current = null;
      }
      setNfcScanning(false);
    }
  }, [isOpen, carnet]);

  const cleanUid = useCallback((value) => String(value || '').trim().toUpperCase(), []);

  const activarUid = useCallback(async (uidValue) => {
    setError('');
    setSuccess('');

    const normalizedUid = cleanUid(uidValue);
    if (!normalizedUid) {
      setError('Ingresa un UID valido para activar el RFID');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/carnets/${carnet.id}/rfid`,
        { uid: normalizedUid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUid(normalizedUid);
      setSuccess('UID activado correctamente en este carnet');
      if (onRfidUpdated) {
        onRfidUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo activar el UID RFID');
    } finally {
      setLoading(false);
    }
  }, [carnet, cleanUid, onClose, onRfidUpdated, token]);

  const startNfcScan = useCallback(async () => {
    if (!nfcSupported) {
      setError('NFC no disponible. Ingresa el UID manualmente.');
      return;
    }
    setError('');
    setSuccess('');
    setNfcScanning(true);

    try {
      const abortController = new AbortController();
      nfcAbortRef.current = abortController;

      const ndef = new window.NDEFReader();
      await ndef.scan({ signal: abortController.signal });

      ndef.onreading = (event) => {
        abortController.abort();
        nfcAbortRef.current = null;
        setNfcScanning(false);
        const detectedUid = cleanUid(event.serialNumber.replace(/:/g, ''));
        setUid(detectedUid);
        setSuccess('Tarjeta detectada. Activando...');
        activarUid(detectedUid);
      };

      ndef.onerror = () => {
        setNfcScanning(false);
        setError('Error al leer la tarjeta NFC.');
      };
    } catch (err) {
      setNfcScanning(false);
      if (err.name !== 'AbortError') {
        setError('No se pudo iniciar NFC: ' + (err.message || err.name));
      }
    }
  }, [activarUid, cleanUid, nfcSupported]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const resetBuffer = () => {
      scanBufferRef.current = '';
      scanLastTsRef.current = 0;
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };

    const onKeydown = (event) => {
      if (loading) return;

      const now = Date.now();
      const gap = now - scanLastTsRef.current;

      if (gap > 120) {
        scanBufferRef.current = '';
      }

      if (event.key === 'Enter') {
        const detectedUid = cleanUid(scanBufferRef.current);
        if (detectedUid.length >= 6) {
          setUid(detectedUid);
          setSuccess('UID detectado. Validando y activando...');
          activarUid(detectedUid);
          event.preventDefault();
        }
        resetBuffer();
        return;
      }

      if (event.key.length === 1) {
        scanBufferRef.current += event.key;
        scanLastTsRef.current = now;

        if (scanTimerRef.current) {
          clearTimeout(scanTimerRef.current);
        }

        scanTimerRef.current = setTimeout(() => {
          resetBuffer();
        }, 220);
      }
    };

    window.addEventListener('keydown', onKeydown);

    return () => {
      window.removeEventListener('keydown', onKeydown);
      resetBuffer();
    };
  }, [activarUid, cleanUid, isOpen, loading]);

  const handleDesvincularRfid = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/carnets/${carnet.id}/rfid`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUid('');
      setSuccess('RFID desvinculado correctamente');
      if (onRfidUpdated) {
        onRfidUpdated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desvincular el RFID');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !carnet) {
    return null;
  }

  return (
    <div className="rfid-modal-overlay" onClick={onClose}>
      <div className="rfid-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rfid-modal-header">
          <h3>Acercar al lector</h3>
          <button type="button" className="rfid-modal-close" onClick={onClose}>x</button>
        </div>

        <div className="rfid-pay-zone">
          <div className="rfid-wave"></div>
          <p>Acercar al lector</p>
          <small>Activacion automatica del UID.</small>
        </div>

        <div className="rfid-form">
          <div className="rfid-reader-shell">
            <div className="rfid-reader-title">
              {nfcScanning ? 'Esperando tarjeta...' : 'Acercar al lector'}
            </div>
            <div className="rfid-reader-subtitle">
              {nfcScanning ? 'Acerca tu tarjeta RFID al celular' : 'Detectando UID...'}
            </div>
            <div className={`rfid-reader-dot${nfcScanning ? ' scanning' : ''}`}></div>
          </div>

          <p className="rfid-current">
            {uid ? `UID actual: ${uid}` : 'UID actual: --'}
          </p>

          {error && <p className="rfid-error">{error}</p>}
          {success && <p className="rfid-success">{success}</p>}

          {/* Escaneo NFC en celular */}
          {nfcSupported && (
            <button
              type="button"
              className={`rfid-btn-nfc${nfcScanning ? ' active' : ''}`}
              onClick={nfcScanning ? () => { nfcAbortRef.current?.abort(); setNfcScanning(false); } : startNfcScan}
              disabled={loading}
            >
              {nfcScanning ? '⏹ Cancelar escaneo' : '📡 Escanear con NFC'}
            </button>
          )}

          {/* Ingreso manual */}
          <div className="rfid-manual-group">
            <label className="rfid-manual-label">Ingresar UID manualmente</label>
            <div className="rfid-manual-row">
              <input
                type="text"
                className="rfid-manual-input"
                placeholder="Ej: 004222793690"
                value={manualUid}
                onChange={(e) => setManualUid(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="rfid-btn-primary"
                onClick={() => activarUid(manualUid)}
                disabled={loading || !manualUid.trim()}
              >
                {loading ? 'Activando...' : 'Activar'}
              </button>
            </div>
          </div>

          <div className="rfid-actions">
            <button type="button" onClick={onClose} className="rfid-btn-cancel">Cerrar</button>
          </div>

          {carnet.rfid_activo && (
            <button
              type="button"
              onClick={handleDesvincularRfid}
              disabled={loading}
              className="rfid-btn-danger"
            >
              Desvincular UID
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RfidActivateModal;
