import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from './db.js';

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27' as any, // Use latest stable
});

const app = express();
const port = process.env.PORT || 3001;

// Webhook needs raw body for signature verification
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        return res.status(400).send('Missing stripe-signature header');
    }
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const stripeCustomerId = session.customer as string;

        if (customerEmail) {
            console.log(`Payment successful for ${customerEmail}`);
            // Update user to premium
            await query(
                'UPDATE users SET tier = $1, stripe_customer_id = $2 WHERE email = $3',
                ['premium', stripeCustomerId, customerEmail]
            );
        }
    }

    res.json({ received: true });
});

// Regular middleware for other routes
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(express.json());

// Email validation schema
const emailSchema = z.string().email();

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    const { email } = req.body;

    try {
        emailSchema.parse(email);
    } catch {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    try {
        // Ensure user exists in DB
        await query(
            'INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
            [email]
        );

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Messy CSV Premium Plan',
                            description: 'Unlimited file size & Excel export',
                        },
                        unit_amount: 500, // $5.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/?upgrade=success`,
            cancel_url: `${process.env.FRONTEND_URL}/?upgrade=cancel`,
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Check subscription status
app.get('/api/user-status/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const { rows } = await query('SELECT tier FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.json({ tier: 'free' });
        }
        res.json({ tier: rows[0].tier });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
