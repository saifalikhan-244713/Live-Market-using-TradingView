// import React from "react";

// const Dropdown = ({ options, onSelect }) => {
//   return (
//     <select onChange={(e) => onSelect(e.target.value)} defaultValue="">
//       {/* <option value="" disabled>
//         Select a coin
//       </option> */}
//       {options.map((option) => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default Dropdown;
import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/styles.css"; // Import your CSS file

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const handleOptionClick = (option) => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container" id="coinDrop" onClick={() => setIsOpen(!isOpen)}>
      <div className="selected-option">{selected || "Select a coin"}</div>
      {isOpen && (
        <div className="options">
          {options.map((option) => (
            <div
              key={option}
              className="option"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Dropdown;
