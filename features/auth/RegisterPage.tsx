import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { UserPlus, Mail, KeyRound, User } from 'lucide-react';
import { APP_NAME } from '../../constants';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    setError(null);
    setIsLoading(true);

    const success = await register({ email, username, password });
    setIsLoading(false);
    if (success) {
      // Consider auto-login or just redirect to login with a success message
      navigate('/login', { state: { registrationSuccess: true, email } });
    } else {
      // Error handling is done within AppContext register, this is a fallback
      setError('Registration failed. The email might already be in use or an error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <Card className="w-full max-w-md shadow-xl dark:shadow-soft-dark">
        <div className="text-center mb-8">
          <UserPlus size={48} className="mx-auto text-primary mb-3" />
          <h2 className="text-3xl font-bold text-text-light dark:text-text-dark">Create Your Account</h2>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">Join {APP_NAME} and start tracking airdrops.</p>
        </div>

        {error && <AlertMessage type="error" message={error} className="mb-4" onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} className="text-gray-400 dark:text-gray-500"/>}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            className="h-11"
          />
          <Input
            id="username"
            type="text"
            label="Username (Optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User size={16} className="text-gray-400 dark:text-gray-500"/>}
            placeholder="Your unique username"
            disabled={isLoading}
            className="h-11"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<KeyRound size={16} className="text-gray-400 dark:text-gray-500"/>}
            placeholder="Create a strong password (min. 6 chars)"
            required
            disabled={isLoading}
            className="h-11"
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<KeyRound size={16} className="text-gray-400 dark:text-gray-500"/>}
            placeholder="Repeat your password"
            required
            disabled={isLoading}
            className="h-11"
          />
          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} size="lg">
            {isLoading ? 'Registering...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
};
