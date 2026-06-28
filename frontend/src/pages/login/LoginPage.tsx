import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const loginSchema = useMemo(() => z.object({
    email: z.string().min(1, t('login.error_required_email')).email(t('login.error_invalid_email')),
    password: z.string().min(6, t('login.error_required_password')),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login(data);
      setAuth(response.user, response.token);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        setGeneralError(validationErrors[firstErrorKey][0]);
      } else if (error.response?.data?.message) {
        setGeneralError(error.response.data.message);
      } else {
        setGeneralError(t('login.error_unexpected'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[60%] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px]" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-card shadow-2xl">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {t('login.title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {generalError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.email_placeholder')}
                  className="pl-10 focus-visible:ring-indigo-500"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80">{t('login.password')}</Label>
              </div>
              <div className="relative">
                <KeyRound className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('login.password_placeholder')}
                  className="pl-10 focus-visible:ring-indigo-500"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-500 dark:hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.submitting')}
                </>
              ) : (
                t('login.submit')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
