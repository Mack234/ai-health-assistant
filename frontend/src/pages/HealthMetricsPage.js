import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, ArrowLeft, TrendingUp, Trash2, Plus } from 'lucide-react';
import { getHealthMetrics, addHealthMetric, deleteHealthMetric } from '@/services/api';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HealthMetricsPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_type: 'weight',
    value: '',
    unit: 'kg',
    notes: ''
  });

  useEffect(() => {
    loadMetrics();
  }, [selectedType]);

  const loadMetrics = async () => {
    try {
      const type = selectedType === 'all' ? null : selectedType;
      const data = await getHealthMetrics(type);
      setMetrics(data);
    } catch (error) {
      toast.error('Failed to load metrics');
    }
  };

  const handleAddMetric = async () => {
    if (!newMetric.value) {
      toast.error('Please enter a value');
      return;
    }

    try {
      await addHealthMetric(newMetric);
      toast.success('Metric added successfully');
      setIsDialogOpen(false);
      setNewMetric({ metric_type: 'weight', value: '', unit: 'kg', notes: '' });
      loadMetrics();
    } catch (error) {
      toast.error('Failed to add metric');
    }
  };

  const handleDeleteMetric = async (metricId) => {
    try {
      await deleteHealthMetric(metricId);
      toast.success('Metric deleted');
      loadMetrics();
    } catch (error) {
      toast.error('Failed to delete metric');
    }
  };

  const getChartData = () => {
    if (selectedType === 'all') return [];
    
    return metrics
      .slice(0, 10)
      .reverse()
      .map(m => ({
        date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(m.value) || 0
      }));
  };

  const metricTypes = [
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'glucose', label: 'Blood Glucose', unit: 'mg/dL' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                data-testid="back-button"
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <span className="text-xl font-heading font-bold text-primary">Health Metrics</span>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-metric-button" className="bg-primary hover:bg-primary/90 text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Metric
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Health Metric</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Metric Type</Label>
                    <Select
                      value={newMetric.metric_type}
                      onValueChange={(value) => {
                        const type = metricTypes.find(t => t.value === value);
                        setNewMetric({ ...newMetric, metric_type: value, unit: type?.unit || '' });
                      }}
                    >
                      <SelectTrigger data-testid="metric-type-select" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metricTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      data-testid="metric-value-input"
                      type="text"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                      placeholder="Enter value"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      data-testid="metric-unit-input"
                      value={newMetric.unit}
                      onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Input
                      data-testid="metric-notes-input"
                      value={newMetric.notes}
                      onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                      placeholder="Any additional notes"
                      className="rounded-xl"
                    />
                  </div>

                  <Button
                    data-testid="save-metric-button"
                    onClick={handleAddMetric}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-full"
                  >
                    Save Metric
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger data-testid="filter-metric-type" className="w-64 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              {metricTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        {selectedType !== 'all' && metrics.length > 0 && (
          <Card className="rounded-2xl border-stone-200 shadow-card mb-6">
            <CardHeader>
              <CardTitle className="font-heading">Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={2} dot={{ fill: '#0F766E' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Metrics List */}
        <Card className="rounded-2xl border-stone-200 shadow-card">
          <CardHeader>
            <CardTitle className="font-heading">Your Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No metrics recorded yet</p>
                <Button
                  data-testid="add-first-metric-inline-button"
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                >
                  Add Your First Metric
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    data-testid={`metric-item-${metric.id}`}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground capitalize">
                        {metric.metric_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(metric.created_at).toLocaleString()}
                      </p>
                      {metric.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{metric.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-semibold text-primary">
                        {metric.value} {metric.unit}
                      </p>
                      <Button
                        data-testid={`delete-metric-${metric.id}`}
                        onClick={() => handleDeleteMetric(metric.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthMetricsPage;