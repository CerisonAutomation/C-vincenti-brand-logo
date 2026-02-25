import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Calendar, Users, MessageSquare, BarChart3, Settings, RefreshCw, CheckSquare, Download, Filter, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type GuestyListing = {
  id: string;
  title: string;
  location: string;
  status: string;
  price: number;
  images: string[];
  amenities: string[];
};

type GuestyReservation = {
  id: string;
  guestName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  createdAt: string;
};

type GuestyTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
};

type GuestyMessage = {
  id: string;
  guestName: string;
  subject: string;
  preview: string;
  timestamp: string;
  type: string;
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  const queryClient = useQueryClient();

  // Overview Dashboard Data
  const { data: dashboardStats } = useQuery({
    queryKey: ['guesty-dashboard'],
    queryFn: async () => {
      try {
        // Get account summary from Guesty
        const accountResponse = await fetch('/api/guesty/account-summary', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('guesty_token')}` }
        });
        const accountData = await accountResponse.json();

        return {
          totalListings: accountData.totalListings || 0,
          activeReservations: accountData.activeReservations || 0,
          monthlyRevenue: accountData.monthlyRevenue || 0,
          occupancyRate: accountData.occupancyRate || 0,
          pendingTasks: accountData.pendingTasks || 0,
          unreadMessages: accountData.unreadMessages || 0,
        };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return {
          totalListings: 0,
          activeReservations: 0,
          monthlyRevenue: 0,
          occupancyRate: 0,
          pendingTasks: 0,
          unreadMessages: 0,
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Properties/Listings Management
  const { data: listings } = useQuery({
    queryKey: ['guesty-listings'],
    queryFn: async (): Promise<GuestyListing[]> => {
      try {
        const response = await fetch('/api/guesty/listings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('guesty_token')}` }
        });
        const data = await response.json();
        return data.listings || [];
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        return [];
      }
    },
  });

  // Reservations Management
  const { data: reservations } = useQuery({
    queryKey: ['guesty-reservations'],
    queryFn: async (): Promise<GuestyReservation[]> => {
      try {
        const response = await fetch('/api/guesty/reservations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('guesty_token')}` }
        });
        const data = await response.json();
        return data.reservations || [];
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        return [];
      }
    },
  });

  // Tasks Management
  const { data: tasks } = useQuery({
    queryKey: ['guesty-tasks'],
    queryFn: async (): Promise<GuestyTask[]> => {
      try {
        const response = await fetch('/api/guesty/tasks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('guesty_token')}` }
        });
        const data = await response.json();
        return data.tasks || [];
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
      }
    },
  });

  // Messages Management
  const { data: messages } = useQuery({
    queryKey: ['guesty-messages'],
    queryFn: async (): Promise<GuestyMessage[]> => {
      try {
        const response = await fetch('/api/guesty/messages', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('guesty_token')}` }
        });
        const data = await response.json();
        return data.messages || [];
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        return [];
      }
    },
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: typeof newTask) => {
      const response = await fetch('/api/guesty/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('guesty_token')}`
        },
        body: JSON.stringify(taskData),
      });
      return response.json();
    },
    onSuccess: () => {
      refetchTasks();
      setTaskDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      toast.success('Task created successfully');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  // Update Task Status Mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await fetch(`/api/guesty/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('guesty_token')}`
        },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      refetchTasks();
      toast.success('Task updated successfully');
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    updateTaskStatusMutation.mutate({ taskId, status });
  };

  return (
    <div>
      <Helmet>
        <title>Guesty Admin Dashboard | Christiano Property Management</title>
        <meta name="description" content="Comprehensive Guesty property management dashboard with reservations, listings, tasks, and analytics." />
      </Helmet>
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Dashboard content coming soon.</p>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-h-[80px] resize-y" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
      )}
    </div>
  );
}
