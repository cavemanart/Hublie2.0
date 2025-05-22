
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: "backInOut",
        }}
        className="p-8 md:p-12 bg-card rounded-xl shadow-2xl border border-destructive/30"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], y: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "mirror", ease:"easeInOut" }}
        >
          <AlertTriangle className="h-24 w-24 md:h-32 md:w-32 text-destructive mx-auto mb-6" />
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-destructive mb-4">404</h1>
        <h2 className="text-2xl md:text-4xl font-semibold mb-3">Oops! Page Not Found.</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          It seems the page you're looking for has wandered off. Don't worry, we'll help you find your way back home.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 text-lg px-8 py-4 rounded-lg shadow-lg">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Go to Homepage
            </Link>
          </Button>
        </motion.div>
        <div className="mt-10">
          <img  
            alt="Confused cartoon character looking at a map" 
            className="w-48 h-auto mx-auto opacity-75"
           src="https://images.unsplash.com/photo-1680995427950-0c91fa640cbf" />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
  