
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2, CheckSquare, Square, Smile, MessageSquare, TrendingUp, Users, Settings, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils'; // Added this import

// Placeholder for Textarea if not created yet - This was part of the original thought, but Textarea is now created.
// const TextareaPlaceholder = React.forwardRef((props, ref) => (
//   <textarea ref={ref} {...props} className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", props.className)} />
// ));
// TextareaPlaceholder.displayName = "Textarea";

// const TextareaComponent = typeof Textarea !== 'undefined' ? Textarea : TextareaPlaceholder;
// Using the actual Textarea component now
const TextareaComponent = Textarea;


// Mock data - replace with actual data fetching and state management
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
                <DialogTitle>Add New {title.slice(0,-1)}</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new {title.toLowerCase().slice(0,-1)}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Example form fields, customize per section */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`${title}-name`} className="text-right">
                    Name
                  </Label>
                  <Input id={`${title}-name`} placeholder={`Enter ${title.toLowerCase().slice(0,-1)} name`} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`${title}-details`} className="text-right">
                    Details
                  </Label>
                  <TextareaComponent id={`${title}-details`} placeholder="Enter details..." className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Save {title.slice(0,-1)}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);


const DashboardPage = () => {
  const { user } = useAuth();
  const { household, currentMemberPermissions } = useHousehold(); // Assuming currentMemberPermissions is available

  if (!user || !household) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Loading your dashboard...</h1>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }
  
  // This is a simplified permission check. Real implementation would be more granular.
  const canView = (feature) => {
    if (!currentMemberPermissions) return true; // Default to true if no permissions defined
    return currentMemberPermissions.view?.includes(feature) || currentMemberPermissions.manage?.includes(feature);
  };

  const canManage = (feature) => {
    if (!currentMemberPermissions) return false; // Default to false
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
            <Button variant="outline"><Settings className="mr-2 h-4 w-4"/>Household Settings</Button>
            <Button variant="outline"><Bell className="mr-2 h-4 w-4"/>Notifications</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Shared Notes */}
        {canView('notes') && (
          <DashboardSection title="Shared Notes" icon={<MessageSquare />} onAdd={canManage('notes') ? (() => {}) : null}>
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

        {/* Bills Dashboard */}
        {canView('bills') && (
          <DashboardSection title="Bills" icon={<TrendingUp />} onAdd={canManage('bills') ? (() => {}) : null}>
            {mockBills.length > 0 ? mockBills.map(bill => (
              <Card key={bill.id} className="mb-3 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{bill.name} - ${bill.amount}</h4>
                    <p className="text-sm text-muted-foreground">Due: {bill.dueDate} ({bill.category})</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${bill.status === 'paid' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                    {bill.status}
                  </span>
                </div>
                 {canManage('bills') && (
                    <div className="flex gap-1 mt-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
              </Card>
            )) : <p className="text-muted-foreground text-sm">No bills tracked. Stay on top of your finances!</p>}
          </DashboardSection>
        )}

        {/* Chores */}
        {canView('chores') && (
          <DashboardSection title="Chores" icon={<CheckSquare />} onAdd={canManage('chores') ? (() => {}) : null}>
            {mockChores.length > 0 ? mockChores.map(chore => (
              <Card key={chore.id} className="mb-3 p-3 bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{chore.name}</h4>
                    <p className="text-sm text-muted-foreground">Due: {chore.dueDate} (To: {chore.assignedTo})</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {chore.status === 'completed' ? <CheckSquare className="h-5 w-5 text-green-500" /> : <Square className="h-5 w-5 text-yellow-500" />}
                  </Button>
                </div>
                {canManage('chores') && (
                    <div className="flex gap-1 mt-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
              </Card>
            )) : <p className="text-muted-foreground text-sm">No chores assigned. Enjoy the peace (for now)!</p>}
          </DashboardSection>
        )}

        {/* Appreciation Feed (Placeholder) */}
         {canView('appreciation') && (
            <DashboardSection title="Appreciation Feed" icon={<Smile />} onAdd={canManage('appreciation') ? (() => {}) : null}>
                <p className="text-muted-foreground text-sm">Share some love! No appreciations posted yet.</p>
            </DashboardSection>
        )}

        {/* Weekly Sync Up (Placeholder) */}
        {canView('weeklySync') && (
            <DashboardSection title="Weekly Sync Up" icon={<Users />} onAdd={canManage('weeklySync') ? (() => {}) : null}>
                <p className="text-muted-foreground text-sm">Time to connect! Start your weekly sync.</p>
            </DashboardSection>
        )}
        
        {/* More sections based on roles and permissions can be added here */}

      </div>
      {user.role === 'Parent/Adult' && (
        <motion.div className="mt-8 p-6 bg-primary/10 rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-primary mb-3">Admin Tools</h2>
          <p className="text-muted-foreground mb-4">Manage your household members, roles, and overall settings.</p>
          <div className="flex gap-4">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Manage Users</Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Subscription & Billing</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
  