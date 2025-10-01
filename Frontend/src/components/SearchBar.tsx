import React, { useState } from 'react';
import { TextField } from '@mui/material';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <TextField
      label="Search"
      variant="outlined"
      value={searchTerm}
      onChange={handleSearch}
      fullWidth
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: "#9333EA", // purple-600 hex
          },
        },
        "& label.Mui-focused": {
          color: "#9333EA", // label color when focused
        },
      }}

    />
  );
};

export default SearchBar;