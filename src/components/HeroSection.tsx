"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const defaultImages = [
  "/images/ram.png",
  "/images/munna.png",
  "/images/suriya.png",
  "/images/kaushik.png",
];

interface HeroSectionProps {
  images?: string[];
}

export default function HeroSection({ images = defaultImages }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToContent = () => {
    const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
    window.scrollTo({
      top: heroHeight,
      behavior: "smooth",
    });
  };

  // Parallax effect values
  const parallaxOffset = scrollY * 0.5;
  const opacityFade = Math.max(0, 1 - scrollY / 500);
  const scaleEffect = 1 + scrollY * 0.0003;

  return (
    <div
      ref={heroRef}
      className="relative w-full hero-fullscreen overflow-hidden -mx-4 md:-mx-6 -mt-4 md:-mt-6"
      style={{ width: "calc(100% + 2rem)", marginLeft: "-1rem" }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 hero-gradient-overlay z-10 pointer-events-none" />

      {/* Slideshow images with parallax */}
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translateY(${parallaxOffset}px) scale(${scaleEffect})`,
          }}
        >
          <Image
            src={image}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Animated background shapes */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Content overlay */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
        style={{ opacity: opacityFade }}
      >
        <div
          className={`transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Animated title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight">
            <span
              className={`inline-block ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.2s" }}
            >
              Three
            </span>{" "}
            <span
              className={`inline-block gradient-text ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              Idiots
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl md:text-2xl text-white/80 max-w-lg mx-auto drop-shadow-lg mb-8 ${
              isLoaded ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            Manage expenses, laundry, and parking with your roommates
          </p>

          {/* Feature badges */}
          <div
            className={`flex flex-wrap justify-center gap-3 ${
              isLoaded ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            {["Expenses", "Laundry", "Parking", "Chat"].map((feature, i) => (
              <span
                key={feature}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? "w-8 bg-cyan-400"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
        aria-label="Scroll down"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-6 h-6 scroll-indicator group-hover:text-cyan-400" />
      </button>

      {/* Decorative glow effects */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/20 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[200px] bg-teal-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />
    </div>
  );
}
