import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createChart } from "lightweight-charts";
import "../styles/styles.css";

const Dropdown = ({ options, selectedValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    onChange(option.value); 
    setIsOpen(false);
  };

  const selectedLabel = options.find(option => option.value === selectedValue)?.label || "Select Timeframe";

  return (
    <div className="dropdown-container" id="intervalDrop" onClick={() => setIsOpen(!isOpen)}>
      <div className="selected-option">
        {selectedLabel}
      </div>
      {isOpen && (
        <div className="options">
          {options.map((option) => (
            <div
              key={option.value}
              className="option"
              onClick={() => handleOptionClick(option)}
            >
              {option.label} 
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.array.isRequired,
  selectedValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const Chart = ({ selectedCoin }) => {
  const chartContainerRef = useRef();
  const [timeframe, setTimeframe] = useState("1m");
  const [candlestickSeries, setCandlestickSeries] = useState(null);
  const [socket, setSocket] = useState(null);

  const fetchInitialData = async (currentTimeframe) => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${selectedCoin.replace(
          "/",
          ""
        )}&interval=${currentTimeframe}&limit=1000`
      );
      const data = await response.json();
      const formattedData = data.map((item) => ({
        time: Math.floor(item[0] / 1000) + 19800, // Adjust to IST
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
      }));

      return formattedData;
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: "black",
        background: { type: "solid", color: "white" },
      },
      crossHair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    setCandlestickSeries(series);

    const fetchDataForSelectedCoin = async () => {
      const initialData = await fetchInitialData(timeframe);
      if (initialData && initialData.length > 0) {
        series.setData(initialData);
      }
    };

    fetchDataForSelectedCoin();

    const newSocket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedCoin
        .toLowerCase()
        .replace("/", "")}@kline_${timeframe}`
    );

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const candlestick = data.k;

      const newCandle = {
        time: Math.floor(candlestick.t / 1000) + 19800,
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c),
      };

      if (series) {
        series.update(newCandle);
      }
    };

    setSocket(newSocket); 

    return () => {
      newSocket.close();
      chart.remove();
    };
  }, [selectedCoin, timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);

    // Fetch new data for the new timeframe
    const fetchNewData = async () => {
      const newData = await fetchInitialData(newTimeframe);
      if (newData && newData.length > 0 && candlestickSeries) {
        candlestickSeries.setData(newData);
      }
    };

    fetchNewData();

   
    if (socket) {
      socket.close();
    }

    const newSocket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedCoin
        .toLowerCase()
        .replace("/", "")}@kline_${newTimeframe}`
    );

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const candlestick = data.k;

      const newCandle = {
        time: Math.floor(candlestick.t / 1000) + 19800,
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c),
      };

      if (candlestickSeries) {
        candlestickSeries.update(newCandle);
      }
    };

    setSocket(newSocket);
  };

  const timeOptions = [
    { value: "1m", label: "1 Minute" },
    { value: "3m", label: "3 Minutes" },
    { value: "5m", label: "5 Minutes" },
  ];

  return (
    <div>
      <div>
        <Dropdown
          options={timeOptions} 
          selectedValue={timeframe}
          onChange={handleTimeframeChange}
        />
      </div>
      <div className="chart-wrapper">
        <div
          ref={chartContainerRef}
          style={{
            width: "800px",
            height: "400px",
          }}
        />
      </div>
    </div>
  );
};

Chart.propTypes = {
  selectedCoin: PropTypes.string.isRequired,
};

export default Chart;
