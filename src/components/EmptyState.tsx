import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Products Found",
  message = "Try adjusting your filters or search terms to find what you're looking for.",
  onReset
}) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px 24px',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '150px',
      height: '150px',
      background: 'radial-gradient(circle, rgba(110, 86, 207, 0.2) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      zIndex: 0,
    },
    iconWrapper: {
      fontSize: '64px',
      marginBottom: '24px',
      position: 'relative' as const,
      zIndex: 1,
    },
    title: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: '12px',
      position: 'relative' as const,
      zIndex: 1,
    },
    message: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.5)',
      maxWidth: '400px',
      textAlign: 'center' as const,
      marginBottom: '32px',
      lineHeight: 1.5,
      position: 'relative' as const,
      zIndex: 1,
    },
    button: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative' as const,
      zIndex: 1,
    }
  };

  return (
    <motion.div 
      style={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={styles.glow} />
      
      <motion.div
        style={styles.iconWrapper}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🎮
      </motion.div>
      
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>
      
      {onReset && (
        <motion.button 
          style={styles.button}
          onClick={onReset}
          whileHover={{ borderColor: 'rgba(110, 86, 207, 0.8)', backgroundColor: 'rgba(110, 86, 207, 0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
