import  { useState } from "react";
import Chart from "./components/Chart";
import Dropdown from "./components/Dropdown";
import "./styles/styles.css";

const App = () => {
  const [selectedCoin, setSelectedCoin] = useState("ETH/USDT");
  const coins = ["ETH/USDT", "BTC/USDT", "BNB/USDT"];

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  return (
    <div className="chart-container">
      <h1>Binance Live Market Data</h1>
      <Dropdown options={coins} onSelect={handleCoinSelect} />
      <Chart selectedCoin={selectedCoin} />
    </div>
  );
};

export default App;
