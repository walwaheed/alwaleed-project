import React, { useState } from 'react';
import { authAPI } from '../api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestSetup() {
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);
    const [email] = useState(`testuser${Date.now()}@gmail.com`);
    const [password] = useState('TestPassword123!');

    const runTest = async (name, testFn) => {
        setTestResults(prev => ({ ...prev, [name]: { status: 'running' } }));
        try {
            const result = await testFn();
            setTestResults(prev => ({
                ...prev,
                [name]: { status: 'success', data: result }
            }));
            return true;
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [name]: { status: 'error', error: error.message }
            }));
            return false;
        }
    };

    const runAllTests = async () => {
        setTesting(true);
        setTestResults({});

        // Test 1: Backend Health
        await runTest('backend', async () => {
            const response = await fetch('/api/health');
            if (!response.ok) throw new Error('Backend not responding');
            return await response.json();
        });

        // Test 2: Supabase Connection
        await runTest('supabase', async () => {
            const { supabase } = await import('../lib/supabase');
            if (!supabase) throw new Error('Supabase client not initialized');
            return { connected: true };
        });

        // Test 3: Sign Up
        const signUpSuccess = await runTest('signup', async () => {
            try {
                const data = await authAPI.signUp(email, password, 'Test User');
                return data;
            } catch (error) {
                // If user already exists, that's okay for testing
                if (error.message.includes('already registered')) {
                    return { note: 'User already exists (this is okay)' };
                }
                throw error;
            }
        });

        // Test 4: Sign In
        if (signUpSuccess) {
            await runTest('signin', async () => {
                const data = await authAPI.signIn(email, password);
                return data;
            });
        }

        // Test 5: Get Photos (requires auth)
        await runTest('photos', async () => {
            const { supabase } = await import('../lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/photos', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token || ''}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch photos');
            return await response.json();
        });

        setTesting(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'running': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <Card className="p-8">
                    <h1 className="text-3xl font-bold mb-2">Setup Verification</h1>
                    <p className="text-gray-600 mb-6">
                        Test your backend, Supabase, and authentication setup
                    </p>

                    <Button
                        onClick={runAllTests}
                        disabled={testing}
                        className="mb-6"
                        size="lg"
                    >
                        {testing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Running Tests...
                            </>
                        ) : (
                            'Run All Tests'
                        )}
                    </Button>

                    <div className="space-y-4">
                        {[
                            { key: 'backend', label: 'Backend API Health Check' },
                            { key: 'supabase', label: 'Supabase Client Connection' },
                            { key: 'signup', label: 'User Sign Up' },
                            { key: 'signin', label: 'User Sign In' },
                            { key: 'photos', label: 'Fetch Photos API' },
                        ].map(test => {
                            const result = testResults[test.key];
                            return (
                                <Card key={test.key} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(result?.status)}
                                            <div>
                                                <h3 className="font-semibold">{test.label}</h3>
                                                {result?.status === 'error' && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        {result.error}
                                                    </p>
                                                )}
                                                {result?.status === 'success' && result.data && (
                                                    <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded max-w-xl overflow-auto">
                                                        {JSON.stringify(result.data, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Setup Checklist:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ .env file with Supabase credentials</li>
                            <li>✓ .env.local file with Vite Supabase credentials</li>
                            <li>❓ database/setup.sql run in Supabase SQL Editor</li>
                            <li>❓ 'photos' storage bucket created in Supabase</li>
                            <li>❓ Email authentication enabled in Supabase</li>
                        </ul>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Test Account:</strong></p>
                        <p>Email: {email}</p>
                        <p>Password: {password}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
