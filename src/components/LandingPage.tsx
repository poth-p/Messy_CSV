import React from 'react';
import { Link } from 'react-router-dom';
import { CSVUploader } from './CSVUploader';
import type { FileMetadata } from './CSVUploader';
import { FileSpreadsheet, Shield, Zap, Trash2, Calendar, Scissors, AlertCircle, Layers } from 'lucide-react';

interface LandingPageProps {
    onDataparsed: (data: any[], meta: FileMetadata) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDataparsed }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Navbar */}
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-xl">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                        <span>Messy CSV Cleaner</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="https://github.com/poth-p/Messy_CSV" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            v1.0 is Live
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Turn Messy CSVs Into <br className="hidden md:block" />
                            <span className="text-primary">Clean Data in Seconds</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            No signup. No servers. Your data never leaves your browser.
                            Automatically fix duplicates, dates, and formatting errors instantly.
                        </p>

                        <div className="grid gap-4 w-full max-w-md mx-auto">
                            <Link to="/batch" className="h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors flex items-center justify-center gap-2">
                                <Layers className="w-4 h-4" />
                                Batch Process Files (Premium)
                            </Link>
                        </div>

                        {/* Instant Demo Placeholder */}
                        {/* Instant Demo Placeholder */}
                        <div className="mt-12 w-full max-w-4xl mx-auto">
                            <div className="bg-card rounded-xl border shadow-2xl overflow-hidden p-6 md:p-8">
                                <CSVUploader onDataparsed={onDataparsed} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-secondary/10">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful Cleaning Tools</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to sanitize your data without writing a single line of code.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard
                                icon={<Trash2 className="w-6 h-6 text-red-400" />}
                                title="Remove Duplicates"
                                description="Instantly identify and remove exact duplicate rows to ensure data uniqueness."
                            />
                            <FeatureCard
                                icon={<Calendar className="w-6 h-6 text-blue-400" />}
                                title="Fix Dates"
                                description="Standardize messed up date formats (MM/DD/YYYY, ISO 8601) into a single clean format."
                            />
                            <FeatureCard
                                icon={<Scissors className="w-6 h-6 text-orange-400" />}
                                title="Trim Whitespace"
                                description="Automatically strip leading and trailing whitespace from every cell in your file."
                            />
                            <FeatureCard
                                icon={<AlertCircle className="w-6 h-6 text-yellow-400" />}
                                title="Handle Missing Values"
                                description="Fill empty cells with defaults, flag them, or remove incomplete rows entirely."
                            />
                        </div>
                    </div>
                </section>

                {/* Privacy Section */}
                <section id="privacy" className="py-20 border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-3xl mx-auto bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
                            <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Privacy First. Always.</h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                We process your files 100% client-side. Your CSV data never touches our servers.
                                Once you close this tab, your data is gone from memory.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full">
                                    <Zap className="w-4 h-4" /> Client-side only
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                                    <Shield className="w-4 h-4" /> GDPR Compliant
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full">
                                    <FileSpreadsheet className="w-4 h-4" /> No Uploads
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-border bg-background">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Messy CSV Cleaner. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-card p-6 rounded-xl border hover:border-primary/50 transition-colors shadow-sm">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
};
