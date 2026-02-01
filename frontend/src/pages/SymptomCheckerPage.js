import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ArrowLeft, Activity, Loader2 } from 'lucide-react';
import { analyzeSymptoms } from '@/services/api';
import { toast } from 'sonner';

const SymptomCheckerPage = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms, duration, severity);
      setAnalysis(result);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setDuration('');
    setSeverity('');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <Activity className="w-6 h-6 text-accent" />
              <span className="text-xl font-heading font-bold text-accent">Symptom Checker</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="rounded-2xl border-stone-200 shadow-card">
            <CardHeader>
              <CardTitle className="font-heading">Describe Your Symptoms</CardTitle>
              <p className="text-sm text-muted-foreground">Provide detailed information for accurate analysis</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  data-testid="symptoms-input"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail..."
                  className="min-h-32 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  data-testid="duration-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 2 days, 1 week"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger data-testid="severity-select" className="rounded-xl h-12">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  data-testid="analyze-button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-full h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Symptoms'
                  )}
                </Button>
                {analysis && (
                  <Button
                    data-testid="reset-button"
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-full"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="rounded-2xl border-stone-200 shadow-card">
            <CardHeader>
              <CardTitle className="font-heading">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-accent/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter your symptoms and click analyze to see results</p>
                </div>
              ) : (
                <div data-testid="analysis-results" className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                    <h3 className="font-semibold text-accent mb-2">Important Notice</h3>
                    <p className="text-sm text-muted-foreground">
                      This analysis is for informational purposes only. Always consult a healthcare professional for medical advice.
                    </p>
                  </div>

                  <div className="bg-secondary rounded-xl p-6">
                    <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                      {analysis.analysis}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Analyzed on {new Date(analysis.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;