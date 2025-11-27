import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useResumeData } from '../../hooks/useResumeData';
import { ResumeForm } from '../forms/ResumeForm';
import { ResumePreview } from './ResumePreview';
import { ResumeImporter } from './ResumeImporter';
import { JobMatcherPanel } from './JobMatcherPanel';
import { ResumeManagerPanel } from './ResumeManagerPanel';

export const DashboardLayout = () => {
  const { user, signOutUser } = useAuth();
  const resumeContext = useResumeData();
  const theme = useTheme();

  if (!user || resumeContext.loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[100],
      }}
    >
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#111827' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Stack spacing={0} color="white">
            <Typography variant="h6" fontWeight={600}>
              Resume Builder Dashboard
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Signed in as {user.email}
            </Typography>
          </Stack>
          <Button color="inherit" onClick={signOutUser}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <ResumeManagerPanel {...resumeContext} />
              <ResumeImporter hydrateWithParsedData={resumeContext.hydrateWithParsedData} />
              <JobMatcherPanel
                resume={resumeContext.currentResume}
                onTailor={resumeContext.hydrateWithParsedData}
                selectedResumeId={resumeContext.selectedResumeId}
                saveResume={resumeContext.saveResume}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <ResumeForm
                key={resumeContext.selectedResumeId ?? 'new'}
                resume={resumeContext.currentResume}
                onSave={resumeContext.saveResume}
                selectedResumeId={resumeContext.selectedResumeId}
              />
              <ResumePreview
                resume={resumeContext.currentResume}
                onUpdateResume={resumeContext.hydrateWithParsedData}
                selectedResumeId={resumeContext.selectedResumeId}
                saveResume={resumeContext.saveResume}
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

