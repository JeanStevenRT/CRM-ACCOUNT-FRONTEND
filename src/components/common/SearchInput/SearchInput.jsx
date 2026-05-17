import './SearchInput.css';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
}) => {
  return (
    <div className="search-input-wrapper">
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput;