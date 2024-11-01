/* eslint-disable react/prop-types */

const RadioButton = ({ label, value, checked, onChange }) => {
  const handleChange = () => {
    onChange(value);
  };
  return (
    <div className="flex flex-row gap-1 text-sm">
      <input
        className="hidden peer"
        type="radio"
        value={value}
        checked={checked === value}
        onChange={handleChange}
        name={label}
      />
      <label
        htmlFor={label}
        className="inline-flex items-center justify-between w-32 px-4 py-1 text-gray-500 bg-white border border-gray-200 rounded-sm cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={handleChange}
      >
        <div className="w-full text-md font-normal text-center">{label}</div>
      </label>
    </div>
  );
};

export default RadioButton;
