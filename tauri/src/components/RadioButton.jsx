/* eslint-disable react/prop-types */

import { FormControlLabel, Radio } from "@mui/material";

const RadioButton = ({ label, value, checked, onChange }) => {
  const handleChange = () => {
    onChange(value);
  };
  return (
    <div className="flex flex-row gap-1 text-sm">
      <FormControlLabel
        control={<Radio />}
        value={value}
        checked={checked === value}
        onChange={handleChange}
        label={label}
      />
    </div>
  );
};

export default RadioButton;
