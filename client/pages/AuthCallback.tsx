import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      let errorMessage = 'Authentication failed';
      switch (error) {
        case 'oauth_failed':
          errorMessage = 'Google authentication failed';
          break;
        case 'oauth_cancelled':
          errorMessage = 'Google authentication was cancelled';
          break;
        case 'token_failed':
          errorMessage = 'Failed to generate authentication token';
          break;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      navigate('/signin');
      return;
    }

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        
        // Store authentication data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        toast({
          title: "Success!",
          description: "Signed in with Google successfully",
        });
        
        navigate('/dashboard');
        window.location.reload(); // Refresh to update auth state
      } catch (error) {
        console.error('Failed to parse user data:', error);
        toast({
          title: "Error",
          description: "Failed to process authentication data",
          variant: "destructive",
        });
        navigate('/signin');
      }
    } else {
      toast({
        title: "Error",
        description: "Missing authentication data",
        variant: "destructive",
      });
      navigate('/signin');
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
