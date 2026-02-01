import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, ArrowLeft, Plus, Trash2, Check, Clock } from 'lucide-react';
import { getReminders, createReminder, completeReminder, deleteReminder } from '@/services/api';
import { toast } from 'sonner';

const RemindersPage = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    reminder_type: 'medication',
    title: '',
    description: '',
    scheduled_time: '',
    repeat: 'none'
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (error) {
      toast.error('Failed to load reminders');
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createReminder(newReminder);
      toast.success('Reminder created successfully');
      setIsDialogOpen(false);
      setNewReminder({
        reminder_type: 'medication',
        title: '',
        description: '',
        scheduled_time: '',
        repeat: 'none'
      });
      loadReminders();
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await completeReminder(reminderId);
      toast.success('Reminder marked as complete');
      loadReminders();
    } catch (error) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await deleteReminder(reminderId);
      toast.success('Reminder deleted');
      loadReminders();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const getFilteredReminders = () => {
    if (filter === 'all') return reminders;
    if (filter === 'active') return reminders.filter(r => !r.completed);
    if (filter === 'completed') return reminders.filter(r => r.completed);
    return reminders.filter(r => r.reminder_type === filter);
  };

  const filteredReminders = getFilteredReminders();

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
                <Bell className="w-6 h-6 text-accent" />
                <span className="text-xl font-heading font-bold text-accent">Reminders</span>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-reminder-button" className="bg-accent hover:bg-accent/90 text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading">Create Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newReminder.reminder_type}
                      onValueChange={(value) => setNewReminder({ ...newReminder, reminder_type: value })}
                    >
                      <SelectTrigger data-testid="reminder-type-select" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      data-testid="reminder-title-input"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      placeholder="e.g., Take Blood Pressure Medication"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      data-testid="reminder-description-input"
                      value={newReminder.description}
                      onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                      placeholder="Additional details..."
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scheduled Time *</Label>
                    <Input
                      data-testid="reminder-time-input"
                      type="datetime-local"
                      value={newReminder.scheduled_time}
                      onChange={(e) => setNewReminder({ ...newReminder, scheduled_time: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Repeat</Label>
                    <Select
                      value={newReminder.repeat}
                      onValueChange={(value) => setNewReminder({ ...newReminder, repeat: value })}
                    >
                      <SelectTrigger data-testid="reminder-repeat-select" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    data-testid="save-reminder-button"
                    onClick={handleAddReminder}
                    className="w-full bg-accent hover:bg-accent/90 text-white rounded-full"
                  >
                    Save Reminder
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger data-testid="filter-reminders" className="w-64 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reminders</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="medication">Medications</SelectItem>
              <SelectItem value="appointment">Appointments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReminders.length === 0 ? (
            <div className="col-span-full">
              <Card className="rounded-2xl border-stone-200 shadow-card">
                <CardContent className="py-12 text-center">
                  <Bell className="w-16 h-16 text-accent/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No reminders found</p>
                  <Button
                    data-testid="add-first-reminder-inline-button"
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-white rounded-full"
                  >
                    Create Your First Reminder
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <Card
                key={reminder.id}
                data-testid={`reminder-card-${reminder.id}`}
                className={`rounded-2xl border-stone-200 shadow-card ${
                  reminder.completed ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reminder.reminder_type === 'medication'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {reminder.reminder_type}
                        </span>
                        {reminder.repeat !== 'none' && (
                          <span className="text-xs text-muted-foreground">{reminder.repeat}</span>
                        )}
                      </div>
                      <CardTitle className="font-heading text-lg">{reminder.title}</CardTitle>
                    </div>
                    {reminder.completed && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mb-4">{reminder.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    {new Date(reminder.scheduled_time).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    {!reminder.completed && (
                      <Button
                        data-testid={`complete-reminder-${reminder.id}`}
                        onClick={() => handleCompleteReminder(reminder.id)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      data-testid={`delete-reminder-${reminder.id}`}
                      onClick={() => handleDeleteReminder(reminder.id)}
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;