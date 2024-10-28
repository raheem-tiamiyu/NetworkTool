/* eslint-disable react/prop-types */
import React from "react";

const InputFields = ({
  label,
  name,
  tip,
  type,
  value,
  placeholder,
  changeFunction,
}) => {
  const handleChange = (e) => {
    e.preventDefault();
    changeFunction(e.target.value);
  };

  return (
    <div className="mt-4">
      <label
        className="block text-sm font-semibold text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <p className="text-sm font-light text-gray-500">{tip}</p>
    </div>
  );
};

export default InputFields;
