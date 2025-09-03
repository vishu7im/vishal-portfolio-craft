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
    <div className="flex justify-center items-center  ">
      <div className="relative">
        <button
          onClick={handleHeartClick}
          className={`
            relative group px-6 py-4 rounded-2xl min-w-[120px]
            border backdrop-blur-sm shadow-lg
            hover:scale-105 active:scale-95 transition-all duration-300 ease-out
            ${hasLiked
              ? 'bg-gradient-to-r from-red-500/30 via-pink-500/30 to-rose-500/30 border-red-600 shadow-xl shadow-red-500/30'
              : 'bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 hover:bg-gradient-to-r hover:from-red-500/20 hover:via-pink-500/20 hover:to-rose-500/20 hover:border-red-600 hover:shadow-xl'
            }
            ${isAnimating ? 'animate-pulse' : !hasLiked ? 'animate-pulse' : ''}
          `}
        >
          {/* Enhanced glow effect */}
          {hasLiked && (
            <>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/40 via-pink-500/40 to-rose-500/40 rounded-2xl blur-lg opacity-70 animate-pulse" />
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-rose-500/20 rounded-3xl blur-xl opacity-40" />
            </>
          )}

          {/* Button content */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            {/* Heart icon */}
            <Heart
              className={`
                h-6 w-6 transition-all duration-300
                ${hasLiked
                  ? 'text-red-800 fill-red-800 drop-shadow-lg filter brightness-110'
                  : 'text-red-800 group-hover:text-red-900'
                }
                ${isAnimating ? 'animate-bounce' : ''}
              `}
            />

            {/* Heart count with animated number changes */}
            <span
              className={`
                font-bold text-sm transition-all duration-300
                ${hasLiked
                  ? 'text-white drop-shadow-lg'
                  : 'text-gray-700 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white'
                }
                ${isAnimating ? 'animate-pulse' : ''}
              `}
            >
              {heartCount.toLocaleString()}
            </span>
          </div>

          {/* Floating hearts animation */}
          {isAnimating && hasLiked && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%)`,
                    animation: `heartFloat 1000ms ease-out ${i * 125}ms forwards`,
                    ['--rotation' as string]: `${i * 45}deg`,
                  }}
                >
                  <Heart className="w-3 h-3 text-red-400 fill-red-400 opacity-80" />
                </div>
              ))}
            </div>
          )}

          {/* Ripple effect on click */}
          {isAnimating && (
            <div className="absolute inset-0 rounded-2xl border-2 border-red-400/60 animate-ping" />
          )}
        </button>

        {/* Optional floating label */}
        <div className={`
          absolute -bottom-8 left-1/2 transform -translate-x-1/2
          text-xs text-gray-700 dark:text-white/60 transition-opacity duration-300 whitespace-nowrap
          ${hasLiked ? 'opacity-100' : 'opacity-0'}
        `}>
          Thank you! ❤️
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes heartFloat {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-20px) scale(1);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-35px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-50px) scale(0.3);
            }
          }
        `
      }} />
    </div>
  );
}