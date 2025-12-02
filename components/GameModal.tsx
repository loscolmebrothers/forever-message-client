"use client";

interface GameModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export function GameModal({ isOpen, onContinue }: GameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000] animate-fade-in">
      <div
        className="parchment-modal flex flex-col items-center gap-8 bg-cover bg-center"
        style={{
          width: "clamp(300px, 80vw, 500px)",
          padding: "clamp(30px, 6vw, 60px)",
          backgroundImage:
            "url(https://assets.loscolmebrothers.com/textures/parchment.jpg)",
        }}
      >
        <h1
          className="font-apfel text-[#2c3e50] m-0 text-center"
          style={{ fontSize: "clamp(28px, 6vw, 42px)" }}
        >
          Forever Message
        </h1>
        <button
          onClick={onContinue}
          className="parchment-button font-bold py-3 px-10"
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
