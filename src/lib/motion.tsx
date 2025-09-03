
import React from 'react';

interface MotionProps {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  whileInView?: Record<string, any>;
  transition?: Record<string, any>;
  viewport?: Record<string, any>;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: any;
}

type Opacity = number | string;

// Simple utility to simulate Framer Motion functionality
// without adding another dependency
export const motion = {
  div: React.forwardRef<HTMLDivElement, MotionProps & React.HTMLAttributes<HTMLDivElement>>(
    ({ initial, animate, whileHover, whileTap, whileInView, transition, viewport, className, children, style, ...props }, ref) => {
      const [isInView, setIsInView] = React.useState(false);
      const elementRef = React.useRef<HTMLDivElement>(null);
      
      // Combine refs
      const combinedRef = (node: HTMLDivElement) => {
        elementRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      };
      
      React.useEffect(() => {
        if (!whileInView) return;
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView(true);
                if (viewport?.once) {
                  observer.disconnect();
                }
              } else if (!viewport?.once) {
                setIsInView(false);
              }
            });
          },
          { threshold: viewport?.amount || 0.1 }
        );
        
        if (elementRef.current) {
          observer.observe(elementRef.current);
        }
        
        return () => observer.disconnect();
      }, [whileInView, viewport]);
      
      // Calculate final styles based on animation states
      const finalStyle: React.CSSProperties = {
        transition: `all ${transition?.duration || 0.3}s ${transition?.ease || 'ease'} ${transition?.delay || 0}s`,
        ...style,
      };
      
      if (initial && !isInView) {
        Object.entries(initial).forEach(([key, value]) => {
          switch (key) {
            case 'opacity':
              finalStyle.opacity = value as Opacity;
              break;
            case 'y':
              finalStyle.transform = `translateY(${value}px)`;
              break;
            case 'x':
              finalStyle.transform = `translateX(${value}px)`;
              break;
            case 'scale':
              finalStyle.transform = `${finalStyle.transform || ''} scale(${value})`;
              break;
            default:
              (finalStyle as any)[key] = value;
          }
        });
      }
      
      if ((whileInView && isInView) || animate) {
        const animationState = isInView ? whileInView : animate;
        if (animationState) {
          Object.entries(animationState).forEach(([key, value]) => {
            switch (key) {
              case 'opacity':
                finalStyle.opacity = value as Opacity;
                break;
              case 'y':
                finalStyle.transform = `translateY(${value}px)`;
                break;
              case 'x':
                finalStyle.transform = `translateX(${value}px)`;
                break;
              case 'scale':
                finalStyle.transform = `${finalStyle.transform || ''} scale(${value})`;
                break;
              default:
                (finalStyle as any)[key] = value;
            }
          });
        }
      }
      
      return (
        <div 
          ref={combinedRef}
          className={className} 
          style={finalStyle}
          {...props}
        >
          {children}
        </div>
      );
    }
  ),
  // Add more elements as needed
};

export default motion;
