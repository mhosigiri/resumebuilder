import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormValues {
  email: string;
  password: string;
}

export const AuthScreen = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AuthFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setError('');
    try {
      if (isRegister) {
        await signUp(values.email, values.password);
      } else {
        await signIn(values.email, values.password);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #111827, #1f2937)',
        padding: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Resume Builder Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign {isRegister ? 'up' : 'in'} with a professional email to continue.
              </Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Email Address"
                  type="email"
                  required
                  {...register('email')}
                />
                <TextField
                  label="Password"
                  type="password"
                  required
                  {...register('password')}
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isRegister ? 'Create Account' : 'Sign In'}
                </Button>
              </Stack>
            </form>
            <Button variant="outlined" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
            <Button onClick={() => setIsRegister((prev) => !prev)}>
              {isRegister
                ? 'Already have an account? Sign in'
                : 'Need an account? Sign up'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

