import React from 'react';
import logoImage from '@assets/GeekMailProImage_1752066258236.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const sizeClass = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <div className={`${sizeClass} ${className}`}>
        <img
          src={logoImage}
          alt="Geek Mail Pro"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Geek Mail Pro
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={sizeClass}>
        <img
          src={logoImage}
          alt="Geek Mail Pro"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Geek Mail Pro
        </span>
        <span className="text-xs text-gray-500 font-medium">
          The Geektrepreneur
        </span>
      </div>
    </div>
  );
}