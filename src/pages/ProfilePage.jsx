
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Save, UserCircle, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming Select component exists

// Placeholder for Select if not created yet
const SelectPlaceholder = ({ children, ...props }) => <div {...props}>{children}</div>;
SelectPlaceholder.displayName = "Select";
const SelectTriggerPlaceholder = ({ children, ...props }) => <div {...props}>{children}</div>;
SelectTriggerPlaceholder.displayName = "SelectTrigger";
const SelectValuePlaceholder = ({ children, ...props }) => <div {...props}>{children}</div>;
SelectValuePlaceholder.displayName = "SelectValue";
const SelectContentPlaceholder = ({ children, ...props }) => <div {...props}>{children}</div>;
SelectContentPlaceholder.displayName = "SelectContent";
const SelectItemPlaceholder = ({ children, ...props }) => <div {...props}>{children}</div>;
SelectItemPlaceholder.displayName = "SelectItem";


const SelectComponent = typeof Select !== 'undefined' ? Select : SelectPlaceholder;
const SelectTriggerComponent = typeof SelectTrigger !== 'undefined' ? SelectTrigger : SelectTriggerPlaceholder;
const SelectValueComponent = typeof SelectValue !== 'undefined' ? SelectValue : SelectValuePlaceholder;
const SelectContentComponent = typeof SelectContent !== 'undefined' ? SelectContent : SelectContentPlaceholder;
const SelectItemComponent = typeof SelectItem !== 'undefined' ? SelectItem : SelectItemPlaceholder;


const ProfilePage = () => {
  const { user, updateUser, logoutUser } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [role, setRole] = useState(''); // Only editable if parent/admin
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarPreview(user.avatarUrl || '');
      setRole(user.role || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedUserData = {
      displayName,
      // In a real app, avatarFile would be uploaded and URL stored
      // For now, we'll just update the preview URL if a new file is selected
      avatarUrl: avatarFile ? avatarPreview : user.avatarUrl, 
      role: user.role === 'Parent/Adult' ? role : user.role, // Only allow role change if admin
    };

    try {
      await updateUser(updatedUserData); // This would also handle avatar upload
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  const isParentAdmin = user.role === 'Parent/Adult';

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center border-b pb-6">
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-4 group"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
            >
              <Avatar className="w-32 h-32 text-4xl border-4 border-primary shadow-lg">
                <AvatarImage src={avatarPreview} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary/30 text-primary font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-8 w-8" />
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </motion.div>
            <CardTitle className="text-3xl">{user.displayName || "Your Profile"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-lg">Display Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 text-base py-3"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {isParentAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-lg">Role</Label>
                   <SelectComponent value={role} onValueChange={setRole} disabled={isLoading || !isParentAdmin}>
                    <SelectTriggerComponent className="w-full text-base py-3">
                      <SelectValueComponent placeholder="Select your role" />
                    </SelectTriggerComponent>
                    <SelectContentComponent>
                      <SelectItemComponent value="Parent/Adult">Parent/Adult (Admin)</SelectItemComponent>
                      <SelectItemComponent value="Nanny">Nanny</SelectItemComponent>
                      <SelectItemComponent value="Child">Child</SelectItemComponent>
                      <SelectItemComponent value="Grandparent">Grandparent</SelectItemComponent>
                      <SelectItemComponent value="Roommate">Roommate</SelectItemComponent>
                    </SelectContentComponent>
                  </SelectComponent>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-xl font-semibold text-primary flex items-center"><Bell className="mr-2 h-5 w-5"/> Notification Settings</h3>
                 <p className="text-muted-foreground">Manage how you receive updates from Hublie.org. (Settings coming soon!)</p>
                 {/* Placeholder for notification settings */}
                 <Button variant="outline" disabled>Configure Notifications</Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-xl font-semibold text-primary flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/> Account Security</h3>
                 <Button variant="outline" disabled>Change Password</Button>
                 <Button variant="outline" disabled>Two-Factor Authentication</Button>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg px-8 py-3" 
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-5 w-5" /> {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={logoutUser} 
                  className="w-full sm:w-auto text-lg px-8 py-3"
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-5 w-5" /> Log Out
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
  