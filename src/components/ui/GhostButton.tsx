import React from 'react';
import { motion } from 'framer-motion';

type GhostButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  className?: string;
  // add other explicit props your project uses if needed
};

// Cast motion.button to any to avoid FramerMotion/React typing mismatch during CI builds.
// This is a pragmatic fix for production builds; runtime behavior stays the same.
const MotionButton: any = motion.button;

const GhostButton: React.FC<GhostButtonProps> = ({ children, className = '', ...rest }) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${className}`}
      {...rest}
    >
      {children}
    </MotionButton>
  );
};

export default GhostButton;
