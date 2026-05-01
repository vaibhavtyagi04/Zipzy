import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useWalletStore } from '../store/walletStore';
import throttle from 'lodash/throttle';

const WEBSOCKET_URL = 'ws://localhost:5000/ws/market';

export const useMarketWS = () => {
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const isConnecting = useRef(false);
  const reconnectAttempts = useRef(0);
  const { setMarketData, updateSingleAsset, updateHistoricalData, addWhaleAlert } = useWalletStore();

  const throttledUpdate = useCallback(
    throttle((data) => {
      updateSingleAsset(data.symbol, data);
    }, 500),
    [updateSingleAsset]
  );

  const connect = useCallback(() => {
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.OPEN)) return;

    isConnecting.current = true;
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      isConnecting.current = false;
      reconnectAttempts.current = 0;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.current.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.warn("Ignoring malformed market websocket message:", error);
        return;
      }
      
      if (data.type === 'kline') {
        updateHistoricalData(data.symbol, data.data);
      } else if (data.type === 'alert') {
        addWhaleAlert(data.data);
      } else if (typeof data === 'object' && !data.symbol) {
        Object.keys(data).forEach(symbol => {
          updateSingleAsset(symbol, data[symbol]);
        });
      } else if (data.symbol) {
        throttledUpdate(data);
      }
    };

    ws.current.onclose = () => {
      isConnecting.current = false;
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current <= 5) {
        reconnectTimeout.current = setTimeout(connect, reconnectAttempts.current * 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error('Market WebSocket Error:', error);
      ws.current?.close();
    };
  }, [throttledUpdate]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  const subscribe = useCallback((symbols, stream = "ticker") => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'subscribe', symbols, stream }));
    }
  }, []);

  const unsubscribe = useCallback((symbols) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'unsubscribe', symbols }));
    }
  }, []);

  return useMemo(() => ({ subscribe, unsubscribe }), [subscribe, unsubscribe]);
};
