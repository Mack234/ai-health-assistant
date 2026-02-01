import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Activity, Bell, User, LogOut, TrendingUp, Calendar } from 'lucide-react';
import { getHealthMetrics, getReminders } from '@/services/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsData, remindersData] = await Promise.all([
        getHealthMetrics(),
        getReminders()
      ]);
      setMetrics(metricsData.slice(0, 5));
      setReminders(remindersData.filter(r => !r.completed).slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              <span className="text-2xl font-heading font-bold tracking-tight text-primary">HealthAI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button
                data-testid="logout-button"
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Your Health Dashboard</h1>
          <p className="text-lg text-muted-foreground">Everything you need to stay healthy in one place</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'AI Chat',
              description: 'Ask health questions',
              icon: MessageCircle,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
              path: '/chat',
              testId: 'nav-chat-card'
            },
            {
              title: 'Symptom Checker',
              description: 'Analyze symptoms',
              icon: Activity,
              color: 'text-accent',
              bgColor: 'bg-accent/10',
              path: '/symptoms',
              testId: 'nav-symptoms-card'
            },
            {
              title: 'Health Metrics',
              description: 'Track your vitals',
              icon: TrendingUp,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
              path: '/metrics',
              testId: 'nav-metrics-card'
            },
            {
              title: 'Reminders',
              description: 'Manage medications',
              icon: Bell,
              color: 'text-accent',
              bgColor: 'bg-accent/10',
              path: '/reminders',
              testId: 'nav-reminders-card'
            },
          ].map((item, index) => (
            <Card
              key={index}
              data-testid={item.testId}
              onClick={() => navigate(item.path)}
              className="cursor-pointer rounded-2xl border-stone-200 hover:border-primary/20 hover:shadow-hover card"
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Metrics */}
          <Card className="lg:col-span-2 rounded-2xl border-stone-200 shadow-card">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : metrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      data-testid={`metric-item-${metric.id}`}
                      className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-foreground capitalize">{metric.metric_type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">{metric.value} {metric.unit}</p>
                      </div>
                    </div>
                  ))}
                  <Button
                    data-testid="view-all-metrics-button"
                    onClick={() => navigate('/metrics')}
                    variant="outline"
                    className="w-full rounded-full mt-4"
                  >
                    View All Metrics
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No metrics recorded yet</p>
                  <Button
                    data-testid="add-first-metric-button"
                    onClick={() => navigate('/metrics')}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full"
                  >
                    Add Your First Metric
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="rounded-2xl border-stone-200 shadow-card">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : reminders.length > 0 ? (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      data-testid={`reminder-item-${reminder.id}`}
                      className="p-3 bg-accent/10 rounded-xl border border-accent/20"
                    >
                      <p className="font-medium text-foreground text-sm">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(reminder.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <Button
                    data-testid="view-all-reminders-button"
                    onClick={() => navigate('/reminders')}
                    variant="outline"
                    className="w-full rounded-full mt-4"
                  >
                    View All
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4 text-sm">No reminders set</p>
                  <Button
                    data-testid="add-first-reminder-button"
                    onClick={() => navigate('/reminders')}
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-white rounded-full"
                  >
                    Add Reminder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;