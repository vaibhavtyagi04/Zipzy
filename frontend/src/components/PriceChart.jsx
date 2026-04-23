import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

export default function PriceChart({ data, symbol }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    // 1. Root Issue: Chart initializes before data or DOM is ready
    // Fix: Only initialize when both are ready
    if (!chartContainerRef.current || !data || data.length === 0) {
      console.log(`[Chart] Waiting for DOM/Data for ${symbol}...`, { dom: !!chartContainerRef.current, data: data?.length });
      return;
    }

    // 2. Prevent Double Initialization
    if (chartRef.current) return;

    console.log(`[Chart] Initializing chart for ${symbol}`);
    
    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#D1D1D1',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
        },
        width: chartContainerRef.current.clientWidth || 800,
        height: 400,
        timeScale: { borderVisible: false, timeVisible: true },
        rightPriceScale: { borderVisible: false },
        crosshair: {
          vertLine: { color: '#E9B3A2', labelBackgroundColor: '#E9B3A2' },
          horzLine: { color: '#E9B3A2', labelBackgroundColor: '#E9B3A2' },
        },
      });

      // v5 API: Unified addSeries method
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#14F195',
        downColor: '#FF5A5A',
        borderVisible: false,
        wickUpColor: '#14F195',
        wickDownColor: '#FF5A5A',
      });

      candlestickSeries.setData(data);
      chart.timeScale().fitContent();

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      // 3. Chart Cleanup (MANDATORY)
      return () => {
        console.log(`[Chart] Cleaning up ${symbol}`);
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error(`[Chart] Initialization failed for ${symbol}:`, error);
    }
  }, [data, symbol]); // Re-run if data becomes available

  // Handle subsequent Real-time updates
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      const lastPoint = data[data.length - 1];
      seriesRef.current.update(lastPoint);
    }
  }, [data]);

  return (
    <div className="w-full h-[400px] relative bg-black/10 rounded-[40px] overflow-hidden border border-white/5">
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-phantom-bg/60 backdrop-blur-md">
          <div className="w-8 h-8 border-2 border-[#E9B3A2]/20 border-t-[#E9B3A2] rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Synchronizing {symbol}...</p>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
