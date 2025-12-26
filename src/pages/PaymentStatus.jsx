import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Paylink sends 'transactionNo' in the query string
    const transactionNo = searchParams.get('transactionNo');

    useEffect(() => {
        console.log('🔍 PaymentStatus Page Loaded');
        console.log('📋 Full URL:', window.location.href);
        console.log('📋 Search Params:', Object.fromEntries(searchParams));
        console.log('💳 Transaction No:', transactionNo);

        if (!transactionNo) {
            console.error('❌ No transaction number found in URL!');
            setIsLoading(false);
            setErrorMessage('No transaction number found in the URL.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const verifyUrl = `${backendUrl}/api/paylink/verify-payment/${transactionNo}`;
                console.log('🔄 Calling verify endpoint:', verifyUrl);

                const response = await fetch(verifyUrl);
                const data = await response.json();
                console.log('✅ Verify Response:', data);

                if (data.success && data.authenticationResult) {
                    setPaymentData(data);

                    // Invalidate orders cache if payment was successful
                    if (data.authenticationResult.status === 'success') {
                        queryClient.invalidateQueries({ queryKey: ['orders'] });
                        // Also invalidate cart to refresh it (should be empty now)
                        queryClient.invalidateQueries({ queryKey: ['cartItems'] });
                    }
                } else {
                    setErrorMessage('Unable to verify payment status. Please contact support.');
                }
            } catch (error) {
                console.error('❌ Verification Error:', error);
                setErrorMessage('Error verifying payment. Please contact support.');
            } finally {
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [transactionNo, queryClient]);

    // Render loading state
    if (isLoading) {
        return (
            <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh]">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                            <span className="text-2xl">Verifying Payment</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground">
                            Please wait while we verify your payment...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Render error state (no transaction number or verification failed)
    if (errorMessage) {
        return (
            <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh]">
                <Card className="w-full max-w-lg text-center border-red-200">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <AlertCircle className="h-16 w-16 text-red-500" />
                            <span className="text-2xl text-red-600">Verification Error</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg text-gray-700">{errorMessage}</p>
                        <Button onClick={() => navigate('/')} className="w-full">
                            Return to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Get the authentication result details
    const authResult = paymentData?.authenticationResult;
    if (!authResult) return null;

    // Map icon types to actual icon components
    const getIconComponent = (iconType) => {
        switch (iconType) {
            case 'success':
                return <CheckCircle2 className="h-16 w-16 text-green-500" />;
            case 'error':
                return <XCircle className="h-16 w-16 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-16 w-16 text-amber-500" />;
            case 'pending':
                return <Clock className="h-16 w-16 text-blue-500" />;
            default:
                return <AlertCircle className="h-16 w-16 text-gray-500" />;
        }
    };

    // Map status to card styling
    const getCardStyle = (status) => {
        switch (status) {
            case 'success':
                return 'border-green-200 bg-green-50/50';
            case 'denied':
            case 'rejected':
            case 'server_error':
            case 'gateway_error':
                return 'border-red-200 bg-red-50/50';
            case 'cancelled':
            case 'unavailable':
                return 'border-amber-200 bg-amber-50/50';
            case 'pending':
                return 'border-blue-200 bg-blue-50/50';
            default:
                return 'border-gray-200';
        }
    };

    // Map status to title color
    const getTitleColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-700';
            case 'denied':
            case 'rejected':
            case 'server_error':
            case 'gateway_error':
                return 'text-red-700';
            case 'cancelled':
            case 'unavailable':
                return 'text-amber-700';
            case 'pending':
                return 'text-blue-700';
            default:
                return 'text-gray-700';
        }
    };

    return (
        <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh] px-4">
            <Card className={`w-full max-w-lg text-center ${getCardStyle(authResult.status)}`}>
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-4">
                        {getIconComponent(authResult.icon)}
                        <span className={`text-2xl font-bold ${getTitleColor(authResult.status)}`}>
                            {authResult.title}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Authentication Message */}
                    <div className="bg-white/70 p-4 rounded-lg border border-gray-200">
                        <p className="text-lg text-gray-800 leading-relaxed">
                            {authResult.message}
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-2 text-sm">
                        {transactionNo && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Transaction Number</p>
                                <p className="font-mono font-bold text-gray-900">{transactionNo}</p>
                            </div>
                        )}

                        {paymentData?.orderNumber && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Order Number</p>
                                <p className="font-mono font-bold text-gray-900">{paymentData.orderNumber}</p>
                            </div>
                        )}

                        {paymentData?.amount && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Amount</p>
                                <p className="font-bold text-gray-900 text-lg">{paymentData.amount} SAR</p>
                            </div>
                        )}

                        {authResult.code && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Authentication Code</p>
                                <p className="font-mono font-bold text-gray-900">({authResult.code})</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                        {/* View Receipt Button - Only for successful payments */}
                        {authResult.status === 'success' && paymentData?.receiptUrl && (
                            <Button
                                variant="default"
                                onClick={() => window.open(paymentData.receiptUrl, '_blank')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                View Receipt
                            </Button>
                        )}

                        {/* View Orders Button - For successful payments */}
                        {authResult.status === 'success' && (
                            <Button
                                variant="outline"
                                onClick={() => navigate('/Profile')}
                                className="w-full"
                            >
                                View My Orders
                            </Button>
                        )}

                        {/* Try Again Button - For failed/cancelled payments */}
                        {(authResult.status === 'denied' ||
                            authResult.status === 'cancelled' ||
                            authResult.status === 'rejected' ||
                            authResult.status === 'unavailable' ||
                            authResult.status === 'server_error' ||
                            authResult.status === 'gateway_error') && (
                                <Button
                                    variant="default"
                                    onClick={() => navigate('/Pricing')}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                            )}

                        {/* Contact Support Button - For errors */}
                        {(authResult.status === 'server_error' ||
                            authResult.status === 'gateway_error' ||
                            authResult.status === 'rejected') && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open('https://wa.me/966133444101', '_blank')}
                                    className="w-full"
                                >
                                    Contact Support via WhatsApp
                                </Button>
                            )}

                        {/* Return Home Button - Always available */}
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="w-full"
                        >
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentStatus;
