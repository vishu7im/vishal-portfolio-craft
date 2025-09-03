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
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleHeartClick}
        className={`
          relative group p-4 rounded-lg
          bg-gradient-to-br from-pink-500/20 via-red-500/20 to-rose-500/20
          hover:from-pink-500/30 hover:via-red-500/30 hover:to-rose-500/30
          border border-pink-500/40 hover:border-pink-500/60
          backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/50
          animate-pulse
          ${hasLiked ? 'bg-gradient-to-br from-pink-500/40 via-red-500/40 to-rose-500/40 border-pink-500/70 shadow-lg shadow-pink-500/40' : ''}
          ${isAnimating ? 'animate-bounce' : ''}
        `}
      >
        {/* Intense glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-lg
            bg-gradient-to-br from-pink-500/50 via-red-500/50 to-rose-500/50 
            blur-xl opacity-60 group-hover:opacity-90 
            transition-opacity duration-300
            animate-pulse
            ${hasLiked ? 'opacity-80' : ''}
            ${isAnimating ? 'opacity-100 animate-ping' : ''}
          `} 
        />
        
        {/* Extra glow ring */}
        <div 
          className={`
            absolute -inset-2 rounded-lg
            bg-gradient-to-br from-pink-400/30 via-red-400/30 to-rose-400/30 
            blur-2xl opacity-40 group-hover:opacity-70
            transition-opacity duration-500
            ${hasLiked ? 'opacity-60' : ''}
          `} 
        />
        
        {/* Heart icon */}
        <Heart 
          className={`
            h-6 w-6 relative z-10 transition-all duration-300
            ${hasLiked 
              ? 'text-pink-400 fill-pink-400 drop-shadow-lg' 
              : 'text-pink-400/80 hover:text-pink-400'
            }
            ${isAnimating ? 'animate-bounce' : ''}
          `}
        />
        
        {/* Animated particles when liked */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-1.5 h-1.5 bg-pink-400 rounded-full
                  animate-ping opacity-90
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-20px)`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '700ms'
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* Heart count */}
      <div className="text-center">
        <p className="text-sm font-bold bg-gradient-to-r from-pink-400 via-red-400 to-rose-400 bg-clip-text text-transparent">
          {heartCount}
        </p>
      </div>
    </div>
  );
}