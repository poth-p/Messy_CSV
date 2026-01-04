import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold">Privacy Policy</h1>
                </div>

                <p className="text-muted-foreground mb-8">
                    Last Updated: January 4, 2026
                </p>

                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Your Privacy is Our Priority</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Messy CSV Cleaner is built with privacy at its core. Unlike most online tools,
                            your data <strong>never leaves your browser</strong>. All CSV processing happens
                            entirely on your device using client-side JavaScript.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">What We Do NOT Collect</h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>We do not upload or store your CSV files</li>
                            <li>We do not transmit your data to any servers</li>
                            <li>We do not use cookies or tracking technologies</li>
                            <li>We do not collect personal information</li>
                            <li>We do not share data with third parties (because we don't have any)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">LocalStorage Usage</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use browser LocalStorage only to save your preferences, such as:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                            <li>Cookie banner dismissal state</li>
                            <li>User tier information (Free vs Premium)</li>
                            <li>UI preferences (if applicable)</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-2">
                            This data remains on your device and can be cleared at any time through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">GDPR Compliance</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Since we do not collect, process, or store any personal data, Messy CSV Cleaner
                            is inherently GDPR compliant. Your CSV files are processed entirely in your browser's
                            memory and are never transmitted over the network.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Premium Payments (Stripe)</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you choose to upgrade to a Premium plan, payment processing is handled securely
                            by Stripe. We do not store your credit card information. Stripe's privacy policy
                            applies to payment transactions:{' '}
                            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline">
                                stripe.com/privacy
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time. Any changes will be posted
                            on this page with an updated "Last Updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at:{' '}
                            <a href="mailto:privacy@messycsv.com" className="text-primary hover:underline">
                                privacy@messycsv.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
