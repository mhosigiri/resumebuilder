import { useState } from 'react';
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
import { jobMatchResume } from '../../services/api';
import type { ResumeData } from '../../types/resume';

interface Props {
  resume: ResumeData;
  onTailor: (resume: ResumeData) => void;
  selectedResumeId: string | null;
  saveResume: (data: ResumeData) => Promise<void>;
}

export const JobMatcherPanel = ({
  resume,
  onTailor,
  selectedResumeId,
  saveResume,
}: Props) => {
  const [jobDescription, setJobDescription] = useState(resume.jobDescription ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTailor = async () => {
    if (!selectedResumeId) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const { tailoredText, updatedResume } = await jobMatchResume({
        jobDescription,
        resume,
      });
      onTailor({ ...updatedResume, tailoredResumeText: tailoredText, jobDescription });
      await saveResume({
        ...updatedResume,
        tailoredResumeText: tailoredText,
        jobDescription,
      });
      setSuccessMessage('Resume tailored to the job description.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRaw = () => {
    const blob = new Blob(
      [resume.tailoredResumeText ?? 'Tailor the resume to generate content.'],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${resume.resumeTitle.replace(/\s+/g, '_')}_tailored.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Job Matching & Keyword Optimization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paste a job description and let AI weave relevant keywords into your resume.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          <TextField
            label="Job Description"
            multiline
            minRows={4}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <Button variant="contained" onClick={handleTailor} disabled={loading || !selectedResumeId}>
            Match & Tailor Resume
          </Button>
          <Button variant="outlined" onClick={handleDownloadRaw}>
            Download Tailored .txt
          </Button>
          {loading && <LinearProgress />}
        </Stack>
      </CardContent>
    </Card>
  );
};

