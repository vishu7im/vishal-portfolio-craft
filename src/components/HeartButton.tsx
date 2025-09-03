import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

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
          minimal-card
          hover:scale-110 transition-all duration-300 ease-out
          ${hasLiked 
            ? 'bg-gradient-to-br from-red-500/20 via-pink-500/20 to-rose-500/20 border-red-500/40 shadow-lg shadow-red-500/20' 
            : 'hover:bg-gradient-to-br hover:from-red-500/10 hover:via-pink-500/10 hover:to-rose-500/10'
          }
          ${isAnimating ? 'animate-bounce' : ''}
        `}
      >
        {/* Glow effect for liked state */}
        {hasLiked && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-pink-500/30 to-rose-500/30 rounded-lg blur-md opacity-60 animate-pulse" />
        )}
        
        {/* Heart icon */}
        <Heart 
          className={`
            h-6 w-6 relative z-10 transition-all duration-300
            ${hasLiked 
              ? 'text-red-500 fill-red-500 drop-shadow-sm' 
              : 'text-muted-foreground group-hover:text-red-500'
            }
            ${isAnimating ? 'animate-pulse' : ''}
          `}
        />
        
        {/* Floating hearts animation */}
        {isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 text-red-500"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-25px)`,
                  animation: `heartFloat 800ms ease-out ${i * 100}ms forwards`
                }}
              >
                <Heart className="w-2 h-2 fill-current" />
              </div>
            ))}
          </div>
        )}
      </button>
      
      {/* Heart count */}
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {heartCount}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes heartFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-25px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-40px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}