import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sign In State
    const [signInData, setSignInData] = useState({
        email: '',
        password: ''
    });

    // Sign Up State
    const [signUpData, setSignUpData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.signIn(signInData.email, signInData.password);
            navigate('/Profile');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (signUpData.password !== signUpData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (signUpData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.signUp(signUpData.email, signUpData.password, signUpData.fullName);
            // Auto sign in after signup
            await authAPI.signIn(signUpData.email, signUpData.password);
            navigate('/Profile');
        } catch (err) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">
                        {t('welcome') || 'Welcome'}
                    </h1>
                    <p className="text-gray-600">
                        {t('loginSubtitle') || 'Sign in to access your account'}
                    </p>
                </div>

                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="signin">{t('signIn') || 'Sign In'}</TabsTrigger>
                        <TabsTrigger value="signup">{t('signUp') || 'Sign Up'}</TabsTrigger>
                    </TabsList>

                    {/* Sign In Tab */}
                    <TabsContent value="signin">
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    {t('email') || 'Email'}
                                </Label>
                                <Input
                                    id="signin-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={signInData.email}
                                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signin-password">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    {t('password') || 'Password'}
                                </Label>
                                <Input
                                    id="signin-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={signInData.password}
                                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-gray-900"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('signingIn') || 'Signing in...'}
                                    </>
                                ) : (
                                    t('signIn') || 'Sign In'
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Sign Up Tab */}
                    <TabsContent value="signup">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">
                                    <User className="w-4 h-4 inline mr-2" />
                                    {t('fullName') || 'Full Name'}
                                </Label>
                                <Input
                                    id="signup-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={signUpData.fullName}
                                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-email">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    {t('email') || 'Email'}
                                </Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={signUpData.email}
                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-password">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    {t('password') || 'Password'}
                                </Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={signUpData.password}
                                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    {t('confirmPassword') || 'Confirm Password'}
                                </Label>
                                <Input
                                    id="signup-confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={signUpData.confirmPassword}
                                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-gray-900"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('creatingAccount') || 'Creating account...'}
                                    </>
                                ) : (
                                    t('createAccount') || 'Create Account'
                                )}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        {t('bySigningUp') || 'By signing in, you agree to our'}{' '}
                        <a href="/Privacy" className="text-black font-medium hover:underline">
                            {t('privacyPolicy') || 'Privacy Policy'}
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
}
