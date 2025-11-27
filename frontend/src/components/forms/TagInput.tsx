import { useState } from 'react';
import { Box, Chip, Stack, TextField } from '@mui/material';

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ label, values, onChange, placeholder }: Props) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((value) => value !== tag));
  };

  return (
    <Stack spacing={1}>
      <TextField
        label={label}
        value={inputValue}
        placeholder={placeholder}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTag();
          }
        }}
        helperText="Press Enter to add"
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {values.map((tag) => (
          <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} />
        ))}
      </Box>
    </Stack>
  );
};

