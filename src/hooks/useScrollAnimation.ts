"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

// Component wrapper for scroll animations
export function AnimateOnScroll({
  children,
  animation = "fadeInUp",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  animation?: "fadeInUp" | "slideInLeft" | "slideInRight" | "scaleIn" | "fadeIn";
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollAnimation();

  const animationClasses: Record<string, string> = {
    fadeInUp: "translate-y-8 opacity-0",
    slideInLeft: "-translate-x-8 opacity-0",
    slideInRight: "translate-x-8 opacity-0",
    scaleIn: "scale-95 opacity-0",
    fadeIn: "opacity-0",
  };

  const visibleClasses = "translate-y-0 translate-x-0 scale-100 opacity-100";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? visibleClasses : animationClasses[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
