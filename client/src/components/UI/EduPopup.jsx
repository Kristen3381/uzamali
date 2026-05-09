import React from 'react';
import { X, BookOpen, Star, Info, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EduPopup = ({ isOpen, onClose, title, content, type = 'info' }) => {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <Star className="w-6 h-6 text-yellow-500" />,
    edu: <BookOpen className="w-6 h-6 text-primary" />,
    tip: <Lightbulb className="w-6 h-6 text-accent" />
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-primary overflow-hidden"
        >
          <div className="bg-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold">{title}</h3>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-gray-600 dark:text-gray-300">
            {content}
          </div>

          <div className="p-6 pt-0">
            <button 
              onClick={onClose}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              Got it, thanks!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EduPopup;
