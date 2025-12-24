import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState('loading'); // loading, success, failed
    const [message, setMessage] = useState('Verifying payment...');
    const [receipt, setReceipt] = useState(null);

    // Paylink usually sends 'transactionNo' in the query string
    // e.g., ?transactionNo=17351651651
    const transactionNo = searchParams.get('transactionNo');

    useEffect(() => {
        console.log('🔍 PaymentStatus Page Loaded');
        console.log('📋 Full URL:', window.location.href);
        console.log('📋 Search Params:', Object.fromEntries(searchParams));
        console.log('💳 Transaction No:', transactionNo);

        if (!transactionNo) {
            console.error('❌ No transaction number found in URL!');
            setStatus('failed');
            setMessage('No transaction number found.');
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

                if (data.success && data.status === 'Paid') {
                    setStatus('success');
                    setMessage('Payment successful! Your order has been confirmed.');
                    setReceipt(data.receiptUrl);
                    // Invalidate orders cache so Profile fetches fresh data
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                } else if (data.status === 'Pending') {
                    setStatus('pending');
                    setMessage('Payment is currently pending.');
                } else {
                    setStatus('failed');
                    setMessage(`Payment failed or declined. Status: ${data.status}`);
                }
            } catch (error) {
                console.error('❌ Verification Error:', error);
                setStatus('failed');
                setMessage('Error verifying payment. Please contact support.');
            }
        };

        verifyPayment();
    }, [transactionNo]);

    return (
        <div className="container mx-auto py-20 flex justify-center items-center min-h-[50vh]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-4">
                        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                        {status === 'failed' && <XCircle className="h-12 w-12 text-red-500" />}
                        <span>Payment Status</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg text-muted-foreground">{message}</p>

                    {transactionNo && (
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                            Transaction #: {transactionNo}
                        </p>
                    )}

                    <div className="flex flex-col gap-2">
                        {status === 'success' && receipt && (
                            <Button variant="outline" onClick={() => window.open(receipt, '_blank')}>
                                View Receipt
                            </Button>
                        )}

                        {status === 'success' && (
                            <Button variant="secondary" onClick={() => navigate('/Profile')}>
                                View My Orders
                            </Button>
                        )}

                        <Button onClick={() => navigate('/')}>
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentStatus;
