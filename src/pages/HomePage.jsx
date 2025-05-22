
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, DollarSign, ListChecks, Heart, CalendarDays, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-full hover:shadow-primary/20 transform hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="items-center text-center">
        <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-3">
          {React.cloneElement(icon, { className: "h-10 w-10 text-primary" })}
        </motion.div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const HomePage = () => {
  const features = [
    { icon: <Users />, title: "Shared Notes", description: "Keep everyone in the loop with targeted notes for different family members." },
    { icon: <DollarSign />, title: "Bills Dashboard", description: "Manage household bills, track payments, and split expenses with ease." },
    { icon: <ListChecks />, title: "Chores Management", description: "Assign and track chores, making household responsibilities clear and fun." },
    { icon: <Heart />, title: "Appreciation Feed", description: "Share praise and acknowledge efforts to foster a positive home environment." },
    { icon: <CalendarDays />, title: "Weekly Sync Up", description: "Reflect on wins, set goals, and plan for the week ahead as a household." },
    { icon: <Brain />, title: "Mental Load Tracker", description: "Visualize and distribute the often unseen responsibilities of managing a home." },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 py-8 md:py-16">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "backOut" }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Hublie.org</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10">
          The all-in-one app to manage your home, connect with your family, and simplify shared living.
          Finally, a cozy digital space for your household.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg px-8 py-6 rounded-xl shadow-lg">
              <Link to="/onboarding">Get Started for Free</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 rounded-xl shadow-lg border-primary text-primary hover:bg-primary/10">
              <Link to="/login">Login to Your Household</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-5xl my-16"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10 blur-3xl rounded-full"></div>
          <img  
            alt="Hublie.org dashboard preview on multiple devices" 
            className="rounded-xl shadow-2xl relative z-10 w-full"
           src="https://images.unsplash.com/photo-1686061594225-3e92c0cd51b0" />
        </div>
      </motion.div>

      <section className="w-full max-w-6xl space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold">Everything Your Household Needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.15 + 0.5} />
          ))}
        </div>
      </section>

      <section className="w-full max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 md:p-12 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Ready to Simplify Your Home Life?</CardTitle>
              <CardDescription className="text-lg text-center mt-2 text-muted-foreground">
                Join thousands of families and households finding joy and organization with Hublie.org.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center mt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg px-10 py-7 rounded-xl shadow-lg">
                  <Link to="/onboarding">Create Your Household Hub</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
  