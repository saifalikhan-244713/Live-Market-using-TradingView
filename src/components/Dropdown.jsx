const Dropdown = ({ options, onSelect }) => {
    return (
        <select onChange={(e) => onSelect(e.target.value)} defaultValue="">
            <option value="" disabled>Select a coin</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;

