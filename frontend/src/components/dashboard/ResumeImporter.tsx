import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { parseResumeText, uploadResumeFile } from '../../services/api';
import type { ResumeData } from '../../types/resume';

interface Props {
  hydrateWithParsedData: (resume: ResumeData) => void;
}

export const ResumeImporter = ({ hydrateWithParsedData }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const resume = await uploadResumeFile(file);
      hydrateWithParsedData(resume);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTextParse = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const resume = await parseResumeText(textInput);
      hydrateWithParsedData(resume);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Import Existing Resume
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a PDF/image for AI parsing or paste raw text.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            hidden
            onChange={(event) => handleFileSelect(event.target.files?.[0])}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Upload Resume (PDF or Image)
          </Button>
          <TextField
            label="Paste Resume Text"
            multiline
            minRows={4}
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
          />
          <Button variant="contained" onClick={handleTextParse} disabled={loading}>
            Parse Text with AI
          </Button>
          {loading && <LinearProgress />}
        </Stack>
      </CardContent>
    </Card>
  );
};

