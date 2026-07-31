import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

// How long to keep polling before giving up and telling the user to check back later.
const MAX_POLL_ATTEMPTS = 40; // 40 * 2.5s = 100 seconds
const POLL_INTERVAL_MS = 2500;

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [timedOut, setTimedOut] = useState(false);
    const attemptsRef = useRef(0);
    const pollTimerRef = useRef(null);

    // Our new create-payment/webhook flow sends 'orderNumber' in the query string
    // (Paylink used 'transactionNo' — no longer used, kept out entirely)
    const orderNumber = searchParams.get('orderNumber');
    const wasCancelled = searchParams.get('cancelled') === 'true';

    useEffect(() => {
        if (!orderNumber) {
            setIsLoading(false);
            setErrorMessage('No order number found in the URL.');
            return;
        }

        if (wasCancelled) {
            setIsLoading(false);
            setPaymentData({
                orderNumber,
                orderStatus: 'cancelled',
                status: 'failed',
                title: 'Payment Cancelled',
                message: 'You cancelled the payment. No charge was made.'
            });
            return;
        }

        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const statusUrl = `${backendUrl}/api/moyasar/order-status/${orderNumber}`;

        const checkStatus = async () => {
            try {
                const response = await fetch(statusUrl);
                const data = await response.json();

                if (!data.success) {
                    setErrorMessage('Unable to check payment status. Please contact support.');
                    setIsLoading(false);
                    return;
                }

                // Still processing — the webhook hasn't updated the order yet.
                // Keep polling unless we've hit the attempt limit.
                if (data.orderStatus === 'processing') {
                    attemptsRef.current += 1;

                    if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
                        setTimedOut(true);
                        setIsLoading(false);
                        return;
                    }

                    pollTimerRef.current = setTimeout(checkStatus, POLL_INTERVAL_MS);
                    return;
                }

                // Reached a final state (paid or cancelled)
                setPaymentData(data);
                setIsLoading(false);

                if (data.orderStatus === 'paid') {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    queryClient.invalidateQueries({ queryKey: ['cartItems'] });
                }
            } catch (error) {
                console.error('❌ Status Check Error:', error);
                setErrorMessage('Error checking payment status. Please contact support.');
                setIsLoading(false);
            }
        };

        checkStatus();

        return () => {
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, [orderNumber, wasCancelled, queryClient]);

    // Loading / polling state
    if (isLoading) {
        return (
            <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh]">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                            <span className="text-2xl">Confirming Payment</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground">
                            Please wait while we confirm your payment. This usually takes a few seconds.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Timed out still waiting — don't say it failed, we genuinely don't know yet
    if (timedOut) {
        return (
            <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh] px-4">
                <Card className="w-full max-w-lg text-center border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <Clock className="h-16 w-16 text-blue-500" />
                            <span className="text-2xl font-bold text-blue-700">Still Processing</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg text-gray-700">
                            Your payment is taking longer than usual to confirm. If your payment succeeded,
                            your order will update automatically — check your orders page shortly, or contact
                            support if you don't see it confirmed within a few minutes.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" onClick={() => navigate('/Profile')} className="w-full">
                                View My Orders
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open('https://wa.me/966133444101', '_blank')}
                                className="w-full"
                            >
                                Contact Support via WhatsApp
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state (no order number, or the status check itself failed)
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

    if (!paymentData) return null;

    const isSuccess = paymentData.status === 'success';
    const isFailed = paymentData.status === 'failed';

    const iconComponent = isSuccess
        ? <CheckCircle2 className="h-16 w-16 text-green-500" />
        : isFailed
            ? <XCircle className="h-16 w-16 text-red-500" />
            : <AlertCircle className="h-16 w-16 text-gray-500" />;

    const cardStyle = isSuccess
        ? 'border-green-200 bg-green-50/50'
        : isFailed
            ? 'border-red-200 bg-red-50/50'
            : 'border-gray-200';

    const titleColor = isSuccess
        ? 'text-green-700'
        : isFailed
            ? 'text-red-700'
            : 'text-gray-700';

    return (
        <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh] px-4">
            <Card className={`w-full max-w-lg text-center ${cardStyle}`}>
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-4">
                        {iconComponent}
                        <span className={`text-2xl font-bold ${titleColor}`}>
                            {paymentData.title}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white/70 p-4 rounded-lg border border-gray-200">
                        <p className="text-lg text-gray-800 leading-relaxed">
                            {paymentData.message}
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        {paymentData.orderNumber && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Order Number</p>
                                <p className="font-mono font-bold text-gray-900">{paymentData.orderNumber}</p>
                            </div>
                        )}

                        {paymentData.amount && (
                            <div className="bg-white/70 p-3 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-1">Amount</p>
                                <p className="font-bold text-gray-900 text-lg">{paymentData.amount} SAR</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        {isSuccess && (
                            <Button
                                variant="outline"
                                onClick={() => navigate('/Profile')}
                                className="w-full"
                            >
                                View My Orders
                            </Button>
                        )}

                        {isFailed && (
                            <Button
                                variant="default"
                                onClick={() => navigate('/Pricing')}
                                className="w-full"
                            >
                                Try Again
                            </Button>
                        )}

                        {isFailed && (
                            <Button
                                variant="outline"
                                onClick={() => window.open('https://wa.me/966133444101', '_blank')}
                                className="w-full"
                            >
                                Contact Support via WhatsApp
                            </Button>
                        )}

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
