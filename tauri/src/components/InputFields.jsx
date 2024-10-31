/* eslint-disable react/prop-types */
import { Box, TextField, Typography } from "@mui/material";
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
    <Box mt={2} display={"flex"} flexDirection={"column"}>
      <TextField
        required
        variant="outlined"
        label={label}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <Typography variant="caption">{tip}</Typography>
    </Box>
  );
};

export default InputFields;
