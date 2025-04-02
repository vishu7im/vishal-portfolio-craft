
import { useEffect } from 'react';

export function useTiltEffect() {
  useEffect(() => {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      const rotateX = deltaY * -10; // Negative to make it follow the mouse
      const rotateY = deltaX * 10;
      
      (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };
    
    const handleMouseLeave = (card: Element) => {
      (card as HTMLElement).style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };
    
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });
    
    return () => {
      tiltCards.forEach(card => {
        card.removeEventListener('mousemove', (e) => handleMouseMove(e as MouseEvent, card));
        card.removeEventListener('mouseleave', () => handleMouseLeave(card));
      });
    };
  }, []);
}

export default function TiltEffect() {
  useTiltEffect();
  return null;
}
