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
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-2"
    >
      <button
        onClick={handleHeartClick}
        className={`
          relative group p-2 sm:p-3 rounded-full
          bg-gradient-to-br from-pink-500/10 via-red-500/10 to-rose-500/10
          hover:from-pink-500/20 hover:via-red-500/20 hover:to-rose-500/20
          border border-pink-500/20 hover:border-pink-500/40
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25
          ${hasLiked ? 'bg-gradient-to-br from-pink-500/25 via-red-500/25 to-rose-500/25 border-pink-500/50 shadow-md shadow-pink-500/20' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        {/* Glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 
            bg-gradient-to-br from-pink-500/30 via-red-500/30 to-rose-500/30 blur-lg
            transition-opacity duration-300
            ${hasLiked ? 'opacity-40' : ''}
            ${isAnimating ? 'opacity-60' : ''}
          `} 
        />
        
        {/* Heart icon */}
        <Heart 
          className={`
            h-5 w-5 sm:h-6 sm:w-6 relative z-10 transition-all duration-300
            ${hasLiked 
              ? 'text-pink-500 fill-pink-500 drop-shadow-sm' 
              : 'text-pink-500/70 hover:text-pink-500'
            }
            ${isAnimating ? 'animate-bounce' : ''}
          `}
        />
        
        {/* Animated particles when liked */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-1 h-1 bg-pink-400 rounded-full
                  animate-ping opacity-75
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-15px)`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '500ms'
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* Heart count with gradient text */}
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 bg-clip-text text-transparent">
          {heartCount}
        </p>
        <p className="text-xs text-muted-foreground">
          {heartCount === 1 ? 'like' : 'likes'}
        </p>
      </div>
    </motion.div>
  );
}