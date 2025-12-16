"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { animate, spring } from "animejs";

export function LOSCOLMEBROTHERSLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;

    animate([logoRef.current], {
      transform: "translateX(-50%) scale(1)",
      duration: 0,
    });

    const handleMouseEnter = () => {
      animate([logoRef.current], {
        transform: "translateX(-50%) scale(1.1)",
        duration: 300,
        ease: spring({ bounce: 0.4, duration: 400 }),
      });
    };

    const handleMouseLeave = () => {
      animate([logoRef.current], {
        transform: "translateX(-50%) scale(1)",
        duration: 500,
        ease: spring({ bounce: 0.4, duration: 400 }),
      });
    };

    const element = logoRef.current;
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <a
      ref={logoRef}
      href="https://loscolmebrothers.com"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-0 left-1/2 z-50 cursor-pointer p-2 pb-4 rounded-b-none glass-button-sm opacity-80"
      aria-label="Visit Los Colmebrothers"
    >
      <Image
        src="https://assets.loscolmebrothers.com/logo/landscape/vector.svg"
        alt="Los Colmebrothers"
        width={120}
        height={30}
        className="h-4 w-auto invert-[1]"
      />
    </a>
  );
}
