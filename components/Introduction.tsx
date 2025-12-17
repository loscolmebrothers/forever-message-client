"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { animate, createTimeline, spring } from "animejs";

interface IntroductionProps {
  onComplete: () => void;
}

export default function Introduction({ onComplete }: IntroductionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const text3Ref = useRef<HTMLSpanElement>(null);
  const text4Ref = useRef<HTMLSpanElement>(null);
  const text5Ref = useRef<HTMLSpanElement>(null);
  const text6Ref = useRef<HTMLSpanElement>(null);

  const bottleRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const foreverBottleRef = useRef<HTMLSpanElement>(null);
  const sparkle1Ref = useRef<HTMLSpanElement>(null);
  const sparkle2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textSpringEntryAnimation = {
      opacity: [0, 1],
      translateY: [10, 0],
      ease: spring({ bounce: 0.4, duration: 400 }),
      duration: 250,
    };

    const spriteSpringEntryAnimation = (finalPosition: number = 0) => ({
      opacity: [0, 1],
      scale: [0.5, 1],
      translateY: [20, finalPosition],
      duration: 500,
      ease: spring({ bounce: 0.65, duration: 400 }),
    });

    const timeline = createTimeline();

    timeline
      .add([text1Ref.current], textSpringEntryAnimation, 250)
      .add([text2Ref.current], textSpringEntryAnimation, 900)
      .add([bottleRef.current], spriteSpringEntryAnimation(-16), 1000)
      .add([text3Ref.current, text4Ref.current], textSpringEntryAnimation, 1800)
      .add([heartRef.current], spriteSpringEntryAnimation(), 1900)
      .add([text5Ref.current], textSpringEntryAnimation, 2800)
      .add([text6Ref.current], textSpringEntryAnimation, 3200)
      .add(
        [foreverBottleRef.current, sparkle1Ref.current, sparkle2Ref.current],
        spriteSpringEntryAnimation(-12),
        3200
      )
      .add(
        [sparkle1Ref.current],
        {
          translateY: [-12, -18, -12],
          rotate: [0, 180, 360],
          opacity: [1, 0.6, 1],
          duration: 2000,
          loop: true,
          ease: "inOutSine",
        },
        3200
      )
      .add(
        [sparkle2Ref.current],
        {
          translateY: [-12, -16, -12],
          rotate: [0, -180, -360],
          opacity: [1, 0.7, 1],
          duration: 2500,
          loop: true,
          ease: "inOutSine",
        },
        3200
      )
      .add(
        [buttonRef.current],
        {
          opacity: [0, 1],
          duration: 500,
          ease: "in",
        },
        3500
      )
      .add([socialsRef.current], spriteSpringEntryAnimation(), 3500);
  }, []);

  const handleDiveIn = () => {
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [1, 0],
        filter: ["blur(0px)", "blur(8px)"],
        duration: 500,
        ease: "in",
      });

      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-auto bg-[#0f1f2e] overflow-hidden"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-4">
          <div className="w-full max-w-3xl mx-auto px-4">
            <div
              className="text-white text-base font-light leading-relaxed flex flex-col items-center gap-6"
              style={{
                fontFamily: "ApfelGrotezk, sans-serif",
              }}
            >
              {/* Line 1: Responsive wrapping */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 md:gap-x-3">
                {/* Section 1: Connect your wallet */}
                <span
                  className="inline-flex items-center opacity-0"
                  ref={text1Ref}
                >
                  Connect your wallet.
                </span>

                {/* Section 2: Cast a bottle + sprite */}
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className="opacity-0" ref={text2Ref}>
                    Cast a bottle.
                  </span>
                  <span className="relative w-7 h-7 opacity-0" ref={bottleRef}>
                    <Image
                      src="/assets/bottle-sprites/1.webp"
                      alt="Bottle sprite"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </span>
                </span>

                {/* Section 3: Read and like + heart + bottles */}
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="opacity-0" ref={text3Ref}>
                    Read and like
                  </span>
                  <span className="relative w-6 h-6 opacity-0" ref={heartRef}>
                    <Image
                      src="/assets/like-heart.png"
                      alt="Heart sprite"
                      className="object-contain"
                      width={24}
                      height={24}
                    />
                  </span>
                  <span className="opacity-0" ref={text4Ref}>
                    {"other people's bottles."}
                  </span>
                </span>
              </div>

              {/* Line 2: Watch bottles become forever */}
              <div className="flex items-center justify-center gap-2">
                <span className="opacity-0" ref={text5Ref}>
                  Watch bottles become
                </span>
                <span className="inline-block relative">
                  <span
                    ref={text6Ref}
                    className="text-2xl opacity-0"
                    style={{ fontFamily: "AndreaScript, cursive" }}
                  >
                    forever
                  </span>
                  <span
                    ref={foreverBottleRef}
                    className="inline-block relative w-7 h-7 mx-3 opacity-0"
                  >
                    <Image
                      src="/assets/bottle-sprites/2.webp"
                      alt="Forever bottle sprite"
                      width={28}
                      height={28}
                    />
                  </span>
                  <span
                    ref={sparkle1Ref}
                    className="absolute -top-0.1 right-0 w-4 h-4 opacity-0"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(127, 255, 212, 1))",
                    }}
                  >
                    <Image
                      src="/assets/effects/sparkle-star.png"
                      alt="Sparkle 1"
                      className="object-contain"
                      width={16}
                      height={16}
                    />
                  </span>
                  <span
                    ref={sparkle2Ref}
                    className="absolute -top-0.5 right-2 w-3 h-3 opacity-0"
                    style={{
                      filter: "drop-shadow(0 0 3px rgba(127, 255, 212, 0.9))",
                    }}
                  >
                    <Image
                      src="/assets/effects/sparkle-star.png"
                      alt="Sparkle 2"
                      className="object-contain"
                      width={12}
                      height={12}
                    />
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleDiveIn}
            className="glass-button"
            style={{ opacity: 0 }}
          >
            Dive in
          </button>

          <div
            ref={socialsRef}
            className="absolute bottom-8 flex flex-col items-center gap-2 opacity-0"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/loscolmebrothers/forever-message-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-glass-text-muted hover:text-glass-text transition-colors duration-200"
                aria-label="GitHub Repository"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://sepolia.basescan.org/address/0xe9392f61C18c897cC5e49e3D8b23F9a5704d3342"
                target="_blank"
                rel="noopener noreferrer"
                className="text-glass-text-muted hover:text-glass-text transition-colors duration-200"
                aria-label="Built on Base"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 111 111"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <p className="text-glass-text-muted text-xs font-apfel font-light opacity-40 mt-2">
              (We pay for all the blockchain fees)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
