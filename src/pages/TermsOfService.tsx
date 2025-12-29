import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <FileText className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold">Terms of Service</h1>
                </div>

                <p className="text-muted-foreground mb-8">
                    Last Updated: {new Date().toLocaleDateString()}
                </p>

                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing and using Messy CSV Cleaner, you accept and agree to be bound by the
                            terms and provisions of this agreement. If you do not agree to these Terms of Service,
                            please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Messy CSV Cleaner is a client-side web application that provides tools for cleaning,
                            processing, and exporting CSV files. All processing occurs in your browser; no data
                            is uploaded to our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
                        <p className="text-muted-foreground leading-relaxed mb-2">
                            You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Use the service in compliance with all applicable laws and regulations</li>
                            <li>Not attempt to circumvent any feature limitations or access controls</li>
                            <li>Not reverse engineer, decompile, or disassemble any part of the service</li>
                            <li>Maintain the security of your Premium account credentials (if applicable)</li>
                            <li>Verify the accuracy of cleaned data before using it in production environments</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Disclaimer of Warranties</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                            IMPLIED. We do not guarantee that:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                            <li>The service will be uninterrupted or error-free</li>
                            <li>Data cleaning results will be 100% accurate</li>
                            <li>The service will meet your specific requirements</li>
                            <li>All bugs or defects will be corrected</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            IN NO EVENT SHALL MESSY CSV CLEANER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
                            DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH THE USE OF THIS SERVICE.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-2">
                            You acknowledge that you are solely responsible for verifying the accuracy of any
                            cleaned data before using it in production systems.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Premium Subscriptions</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Premium subscriptions are billed monthly via Stripe. You may cancel your subscription
                            at any time. Refunds are handled on a case-by-case basis within 14 days of purchase.
                            Premium features are subject to change, but core functionality will remain available.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All code, design, graphics, and content on Messy CSV Cleaner are the property of
                            the service provider and are protected by copyright and intellectual property laws.
                            Your CSV data remains your property at all times.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to terminate or suspend access to the service at any time,
                            without prior notice, for conduct that we believe violates these Terms of Service
                            or is harmful to other users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. Changes will be
                            effective immediately upon posting. Your continued use of the service after changes
                            are posted constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For questions about these Terms of Service, contact:{' '}
                            <a href="mailto:legal@messycsv.com" className="text-primary hover:underline">
                                legal@messycsv.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
