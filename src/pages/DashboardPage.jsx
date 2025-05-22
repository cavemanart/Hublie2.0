import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle, Edit3, Trash2, CheckSquare, Square,
  MessageSquare, TrendingUp, Smile, Settings, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data - replace with real state/data fetching
const mockNotes = [
  { id: 'n1', title: 'Grocery List', content: 'Milk, Eggs, Bread, Apples', target: 'All', author: 'Mom' },
  { id: 'n2', title: 'Pick up dry cleaning', content: 'Suit and 2 shirts', target: 'Dad', author: 'Mom' },
];
const mockBills = [
  { id: 'b1', name: 'Rent', amount: 1200, dueDate: '2025-06-01', status: 'unpaid', category: 'Housing' },
  { id: 'b2', name: 'Internet', amount: 60, dueDate: '2025-06-05', status: 'paid', category: 'Utilities' },
];
const mockChores = [
  { id: 'c1', name: 'Take out trash', dueDate: '2025-05-22', status: 'pending', assignedTo: 'Kid1' },
  { id: 'c2', name: 'Wash dishes', dueDate: '2025-05-21', status: 'completed', assignedTo: 'Roommate1' },
];

const DashboardSection = ({ title, children, icon, onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="h-full shadow-lg hover:shadow-primary/10 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          {React.cloneElement(icon, { className: "h-6 w-6 text-primary mr-3" })}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        {onAdd && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
                <PlusCircle className="h-4 w-4 mr-1" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
                <DialogDescription>Fill in the details for your new {title.toLowerCase().slice(0, -1)}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`${title}-name`} className="text-right">Name</Label>
                  <Input id={`${title}-name`} placeholder={`Enter ${title.toLowerCase().slice(0, -1)} name`} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`${title}-details`} className="text-right">Details</Label>
                  <Textarea id={`${title}-details`} placeholder="Enter details..." className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Save {title.slice(0, -1)}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { household, currentMemberPermissions } = useHousehold();

  if (!user || !household) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Loading your dashboard...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  const canView = (feature) => {
    if (!currentMemberPermissions) return true;
    return currentMemberPermissions.view?.includes(feature) || currentMemberPermissions.manage?.includes(feature);
  };

  const canManage = (feature) => {
    if (!currentMemberPermissions) return false;
    return currentMemberPermissions.manage?.includes(feature);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{user.displayName}!</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            You're viewing the <span className="font-semibold text-primary">{household.name}</span> household dashboard.
            Your role: <span className="font-semibold text-secondary">{user.role || 'Member'}</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Household Settings</Button>
          <Button variant="outline"><Bell className="mr-2 h-4 w-4" /> Notifications</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canView('notes') && (
          <DashboardSection title="Shared Notes" icon={<MessageSquare />} onAdd={canManage('notes') ? () => {} : null}>
            {mockNotes.length > 0 ? mockNotes.map(note => (
              <Card key={note.id} className="mb-3 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{note.title}</h4>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{note.content}</p>
                    <p className="text-xs text-primary/80">To: {note.target} (By: {note.author})</p>
                  </div>
                  {canManage('notes') && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </Card>
            )) : <p className="text-muted-foreground text-sm">No notes yet. Add one to get started!</p>}
          </DashboardSection>
        )}

        {canView('bills') && (
          <DashboardSection title="Bills" icon={<TrendingUp />} onAdd={canManage('bills') ? () => {} : null}>
            {mockBills.length > 0 ? mockBills.map(bill => (
              <Card key={bill.id} className="mb-3 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{bill.name} - ${bill.amount}</h4>
                    <p className="text-sm text-muted-foreground">Due: {bill.dueDate} ({bill.category})</p>
                  </div>
                  {canManage('bills') && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </Card>
            )) : <p className="text-muted-foreground text-sm">No bills recorded yet.</p>}
          </DashboardSection>
        )}

        {canView('chores') && (
          <DashboardSection title="Chores" icon={<Smile />} onAdd={canManage('chores') ? () => {} : null}>
            {mockChores.length > 0 ? mockChores.map(chore => (
              <Card key={chore.id} className="mb-3 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{chore.name}</h4>
                    <p className="text-sm text-muted-foreground">Due: {chore.dueDate}</p>
                    <p className="text-xs text-secondary">Assigned to: {chore.assignedTo}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      {chore.status === 'completed' ? <CheckSquare className="h-4 w-4 text-green-500" /> : <Square className="h-4 w-4 text-muted" />}
                    </Button>
                    {canManage('chores') && (
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              </Card>
            )) : <p className="text-muted-foreground text-sm">No chores assigned.</p>}
          </DashboardSection>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
