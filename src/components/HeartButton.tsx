import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from '@/lib/motion';

// Generate a unique device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
};

export default function HeartButton() {
  const [heartCount, setHeartCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load heart count from localStorage
    const savedCount = localStorage.getItem('heart-count');
    const deviceId = getDeviceId();
    const likedDevices = JSON.parse(localStorage.getItem('liked-devices') || '[]');
    
    if (savedCount) {
      setHeartCount(parseInt(savedCount));
    }
    
    if (likedDevices.includes(deviceId)) {
      setHasLiked(true);
    }
  }, []);

  const handleHeartClick = () => {
    const deviceId = getDeviceId();
    const likedDevices = JSON.parse(localStorage.getItem('liked-devices') || '[]');
    
    if (hasLiked) {
      // Unlike
      const newCount = Math.max(0, heartCount - 1);
      const updatedDevices = likedDevices.filter((id: string) => id !== deviceId);
      
      setHeartCount(newCount);
      setHasLiked(false);
      localStorage.setItem('heart-count', newCount.toString());
      localStorage.setItem('liked-devices', JSON.stringify(updatedDevices));
    } else {
      // Like
      const newCount = heartCount + 1;
      const updatedDevices = [...likedDevices, deviceId];
      
      setHeartCount(newCount);
      setHasLiked(true);
      setIsAnimating(true);
      localStorage.setItem('heart-count', newCount.toString());
      localStorage.setItem('liked-devices', JSON.stringify(updatedDevices));
      
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-3 mt-8"
    >
      <button
        onClick={handleHeartClick}
        className={`
          relative group p-4 rounded-full
          bg-gradient-to-r from-pink-500/10 to-red-500/10 
          hover:from-pink-500/20 hover:to-red-500/20
          border border-pink-500/20 hover:border-pink-500/40
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25
          ${hasLiked ? 'bg-gradient-to-r from-pink-500/20 to-red-500/20 border-pink-500/50' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        {/* Glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
            bg-gradient-to-r from-pink-500/30 to-red-500/30 blur-xl
            transition-opacity duration-300
            ${hasLiked ? 'opacity-50' : ''}
          `} 
        />
        
        {/* Heart icon */}
        <Heart 
          className={`
            h-8 w-8 relative z-10 transition-all duration-300
            ${hasLiked 
              ? 'text-pink-500 fill-pink-500' 
              : 'text-pink-500/70 hover:text-pink-500'
            }
            ${isAnimating ? 'animate-bounce' : ''}
          `}
        />
        
        {/* Animated particles when liked */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-1 h-1 bg-pink-500 rounded-full
                  animate-ping opacity-75
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '600ms'
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* Heart count with gradient text */}
      <div className="text-center">
        <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          {heartCount}
        </p>
        <p className="text-xs text-muted-foreground">
          {heartCount === 1 ? 'person likes this' : 'people like this'}
        </p>
      </div>
    </motion.div>
  );
}