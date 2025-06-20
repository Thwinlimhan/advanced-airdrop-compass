import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { LogIn, Mail, KeyRound } from 'lucide-react';
import { APP_NAME } from '../../constants';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await login({ email, password });
    setIsLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <Card className="w-full max-w-md shadow-xl dark:shadow-soft-dark">
        <div className="text-center mb-8">
          <LogIn size={48} className="mx-auto text-primary mb-3" />
          <h2 className="text-3xl font-bold text-text-light dark:text-white">Login to {APP_NAME}</h2>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">Welcome back! Access your airdrop dashboard.</p>
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
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<KeyRound size={16} className="text-gray-400 dark:text-gray-500"/>}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="h-11"
          />
          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} size="lg">
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};
