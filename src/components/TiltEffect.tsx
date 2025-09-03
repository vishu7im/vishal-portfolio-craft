
import React, { useEffect } from 'react';

const TiltEffect: React.FC = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.tilt-card');
    
    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      const rotateX = deltaY * -10;
      const rotateY = deltaX * 10;
      
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = (card: Element) => {
      (card as HTMLElement).style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };
    
    const handleTiltEffect = (e: Event) => {
      if (!(e instanceof MouseEvent)) return;
      
      const target = e.currentTarget;
      if (target instanceof Element) {
        handleMouseMove(e, target);
      }
    };
    
    const handleTiltReset = (e: Event) => {
      const target = e.currentTarget;
      if (target instanceof Element) {
        handleMouseLeave(target);
      }
    };
    
    cards.forEach(card => {
      card.addEventListener('mousemove', handleTiltEffect);
      card.addEventListener('mouseleave', handleTiltReset);
    });
    
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleTiltEffect);
        card.removeEventListener('mouseleave', handleTiltReset);
      });
    };
  }, []);
  
  return null;
};

export default TiltEffect;
