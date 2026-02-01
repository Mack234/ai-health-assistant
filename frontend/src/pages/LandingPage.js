import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Activity, Bell, Shield, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F0E9] via-[#E0F2F1] to-[#FDFCF8]">
      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-heading font-bold tracking-tight text-primary">HealthAI</span>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="login-button"
              variant="ghost"
              onClick={() => navigate('/auth?mode=login')}
              className="rounded-full"
            >
              Sign In
            </Button>
            <Button
              data-testid="get-started-button"
              onClick={() => navigate('/auth?mode=register')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-foreground leading-tight">
              Your Personal
              <span className="text-primary block mt-2">AI Health Assistant</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Get instant health insights, track your vitals, manage medications, and receive personalized wellness guidance - all powered by advanced AI.
            </p>
            <div className="flex gap-4">
              <Button
                data-testid="hero-get-started-button"
                onClick={() => navigate('/auth?mode=register')}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free Today
              </Button>
              <Button
                data-testid="learn-more-button"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg border-2 border-primary text-primary hover:bg-primary/5"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1659353888096-cc5e333db5e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXRpZW50JTIwY29uc3VsdGF0aW9uJTIwZnJpZW5kbHl8ZW58MHx8fHwxNzY5OTMxODE0fDA&ixlib=rb-4.1.0&q=85"
              alt="Friendly doctor consultation"
              className="rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Everything You Need for Better Health</h2>
          <p className="text-lg text-muted-foreground">Comprehensive health management in one beautiful platform</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MessageCircle,
              title: 'AI Health Chat',
              description: 'Get instant answers to health questions from our intelligent AI assistant',
              color: 'text-primary',
              testId: 'feature-ai-chat'
            },
            {
              icon: Activity,
              title: 'Symptom Checker',
              description: 'Analyze symptoms and receive guidance on when to seek medical care',
              color: 'text-accent',
              testId: 'feature-symptom-checker'
            },
            {
              icon: Heart,
              title: 'Health Tracking',
              description: 'Monitor weight, blood pressure, glucose, and more with beautiful charts',
              color: 'text-primary',
              testId: 'feature-health-tracking'
            },
            {
              icon: Bell,
              title: 'Smart Reminders',
              description: 'Never miss medications or appointments with intelligent notifications',
              color: 'text-accent',
              testId: 'feature-reminders'
            },
            {
              icon: Shield,
              title: 'Privacy First',
              description: 'Your health data is encrypted and secure, always under your control',
              color: 'text-primary',
              testId: 'feature-privacy'
            },
            {
              icon: Sparkles,
              title: 'Personalized Insights',
              description: 'Receive tailored health recommendations based on your unique profile',
              color: 'text-accent',
              testId: 'feature-insights'
            },
          ].map((feature, index) => (
            <div
              key={index}
              data-testid={feature.testId}
              className="bg-white rounded-2xl p-8 border border-stone-100 hover:border-primary/20 hover:shadow-hover card"
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands who trust HealthAI for their wellness journey</p>
          <Button
            data-testid="cta-get-started-button"
            onClick={() => navigate('/auth?mode=register')}
            className="bg-white text-primary hover:bg-stone-100 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" fill="currentColor" />
              <span className="font-heading font-bold text-primary">HealthAI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 HealthAI. Empowering your wellness journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;