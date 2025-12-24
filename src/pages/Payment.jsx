import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Payment Page
 * Allows user to review order total and initiate Paylink payment
 */
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // In a real flow, you would pass order data via location state or fetch from a cart context
    // Defaulting to some dummy data for demonstration if not provided
    const { totalAmount, items } = location.state || {
        totalAmount: 100,
        items: [{ title: "Demo Item", price: 100, qty: 1 }]
    };

    const [isLoading, setIsLoading] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientMobile, setClientMobile] = useState('');

    // Basic validation
    const isValid = clientName.trim().length > 0 && clientMobile.trim().length > 9;

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // Generate a random order number for this demo
            const orderNumber = Math.floor(Math.random() * 1000000).toString();

            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${backendUrl}/api/paylink/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    clientName,
                    clientMobile,
                    orderNumber,
                    items
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initialization failed');
            }

            if (data.success && data.paymentUrl) {
                // Redirect to Paylink
                window.location.href = data.paymentUrl;
            } else {
                toast.error("Failed to get payment URL");
            }

        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    <CardDescription>Complete your purchase securely with Paylink</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between font-medium">
                            <span>Total Amount</span>
                            <span>{totalAmount} SAR</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {items.length} items
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Your Name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                            id="mobile"
                            placeholder="05xxxxxxxx"
                            value={clientMobile}
                            onChange={(e) => setClientMobile(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handlePayment}
                        disabled={isLoading || !isValid}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Pay {totalAmount} SAR
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Payment;
