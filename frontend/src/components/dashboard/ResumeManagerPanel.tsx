import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import type { ResumeData } from '../../types/resume';

interface ResumeRecord {
  id: string;
  data: ResumeData;
}

interface Props {
  resumes: ResumeRecord[];
  selectedResumeId: string | null;
  selectResume: (id: string) => void;
  createResume: (title: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
}

export const ResumeManagerPanel = ({
  resumes,
  selectedResumeId,
  selectResume,
  createResume,
  deleteResume,
}: Props) => {
  const [newResumeTitle, setNewResumeTitle] = useState('');

  const handleCreate = async () => {
    if (!newResumeTitle.trim()) return;
    await createResume(newResumeTitle.trim());
    setNewResumeTitle('');
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Resumes by Job Title
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Switch between tailored resumes for different roles.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Job Title"
              fullWidth
              size="small"
              value={newResumeTitle}
              onChange={(event) => setNewResumeTitle(event.target.value)}
            />
            <Button variant="contained" onClick={handleCreate}>
              Add
            </Button>
          </Stack>
          <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
            {resumes.map((resume) => (
              <ListItem
                key={resume.id}
                secondaryAction={
                  <IconButton onClick={() => deleteResume(resume.id)} edge="end">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton
                  selected={resume.id === selectedResumeId}
                  onClick={() => selectResume(resume.id)}
                >
                  <ListItemText
                    primary={resume.data.resumeTitle}
                    secondary={resume.data.targetRole || 'No target role'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {!resumes.length && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No resumes yet. Create one to get started.
              </Typography>
            )}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
};

