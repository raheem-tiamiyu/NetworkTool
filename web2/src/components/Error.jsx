/* eslint-disable react/prop-types */
import React from "react";

const Error = ({ data }) => {
  return (
    <div>
      <p className="text-red-500 text-md">{data?.error}</p>
    </div>
  );
};

export default Error;
