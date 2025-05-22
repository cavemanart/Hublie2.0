
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { UserPlus, Home, Users, Mail, KeyRound, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const { createHousehold, joinHousehold } = useHousehold();

  // Create Household State
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [householdName, setHouseholdName] = useState('');

  // Join Household State
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinDisplayName, setJoinDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!createEmail || !createPassword || !displayName || !householdName) {
      toast({ title: "Missing Fields", description: "Please fill all fields to create a household.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const newUser = await registerUser(createEmail, createPassword, displayName, 'Parent/Adult');
      if (newUser) {
        const newHousehold = await createHousehold(householdName, newUser.id);
        if (newHousehold) {
          toast({ title: "Household Created!", description: `Welcome to ${householdName}, ${displayName}!` });
          navigate('/dashboard');
        } else {
          toast({ title: "Household Creation Failed", description: "Could not create household. Please try again.", variant: "destructive" });
        }
      } else {
         toast({ title: "Registration Failed", description: "Could not create user account. The email might already be in use.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!joinEmail || !joinPassword || !joinDisplayName || !inviteCode) {
      toast({ title: "Missing Fields", description: "Please fill all fields to join a household.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    try {
      const newUser = await registerUser(joinEmail, joinPassword, joinDisplayName, 'Roommate'); // Default role for joining
      if (newUser) {
        const joinedHousehold = await joinHousehold(inviteCode, newUser.id);
        if (joinedHousehold) {
          toast({ title: "Joined Household!", description: `Welcome aboard, ${joinDisplayName}!` });
          navigate('/dashboard');
        } else {
          toast({ title: "Join Failed", description: "Invalid invite code or household not found.", variant: "destructive" });
        }
      } else {
        toast({ title: "Registration Failed", description: "Could not create user account. The email might already be in use.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
             <motion.div 
              className="mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <UserPlus className="h-16 w-16 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl">Join Hublie.org</CardTitle>
            <CardDescription>Create a new household or join an existing one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create"><Home className="mr-2 h-4 w-4" />Create Household</TabsTrigger>
                <TabsTrigger value="join"><Users className="mr-2 h-4 w-4" />Join Household</TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <form onSubmit={handleCreateHousehold} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Your Name</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="displayName" placeholder="e.g., Jane Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email Address</Label>
                     <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="create-email" type="email" placeholder="you@example.com" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="create-password" type="password" placeholder="••••••••" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="householdName">Household Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="householdName" placeholder="e.g., The Happy Home" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg py-3" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Household & Account'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="join">
                <form onSubmit={handleJoinHousehold} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="join-displayName">Your Name</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="join-displayName" placeholder="e.g., John Smith" value={joinDisplayName} onChange={(e) => setJoinDisplayName(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="join-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="join-email" type="email" placeholder="you@example.com" value={joinEmail} onChange={(e) => setJoinEmail(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-password">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="join-password" type="password" placeholder="••••••••" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="inviteCode" placeholder="Enter household invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required className="pl-10" disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg py-3" disabled={isLoading}>
                    {isLoading ? 'Joining...' : 'Join Household & Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
  