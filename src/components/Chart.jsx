
import  { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { createChart } from "lightweight-charts";

const Chart = ({ selectedCoin }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: "black",
        background: { type: "solid", color: "white" },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Fetch initial data
    const fetchInitialData = async () => {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${selectedCoin.replace(
          "/",
          ""
        )}&interval=1m&limit=20`
      );
      const data = await response.json();
      const formattedData = data.map((item) => ({
        time: item[0] / 1000,
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
      }));
      candlestickSeries.setData(formattedData);
    };

    fetchInitialData();

    // WebSocket connection for live updates
    const newSocket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedCoin
        .toLowerCase()
        .replace("/", "")}@kline_1m`
    );

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const candlestick = data.k;

      const newCandle = {
        time: candlestick.t / 1000,
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c),
      };

      candlestickSeries.update(newCandle); // Update the series directly
    };

    // Cleanup on component unmount
    return () => {
      newSocket.close();
      chart.remove();
    };
  }, [selectedCoin]);

  return (
    <div>
      <h2>{selectedCoin} Candlestick Chart</h2>
      <div
        ref={chartContainerRef}
        style={{ width: "800px", height: "400px" }}
      />
    </div>
  );
};

Chart.propTypes = {
  selectedCoin: PropTypes.string.isRequired,
};

export default Chart;






