import  { useState } from "react";
import Dropdown from "./components/Dropdown";
import Chart from "./components/Chart";

const App = () => {
  const [selectedCoin, setSelectedCoin] = useState("");
  const options = ["ETH/USDT", "BNB/USDT", "DOT/USDT"];

  return (
    <div>
      <h1>Binance Live Candlestick Chart</h1>
      <Dropdown options={options} onSelect={setSelectedCoin} />
      {selectedCoin && <Chart selectedCoin={selectedCoin} />}
    </div>
  );
};

export default App;

