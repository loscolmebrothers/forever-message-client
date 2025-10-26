import type { Bottle } from "@loscolmebrothers/forever-message-types";

/**
 * Mock bottle data for Phase 1 MVP
 * In Phase 2, this will be replaced with real data from blockchain + IPFS
 */

// Helper to create dates
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const mockBottles: Bottle[] = [
  {
    id: 1,
    creator: "0x1234567890123456789012345678901234567890",
    ipfsHash: "QmMock1HashABCDEF123456",
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(25),
    isForever: false,
    exists: true,
    message:
      "Hello from the digital ocean! 🌊 This is my first message in a bottle.",
    userId: "user-alice",
    type: "bottle",
    timestamp: daysAgo(5).getTime(),
    likeCount: 12,
    commentCount: 3,
  },
  {
    id: 2,
    creator: "0x2345678901234567890123456789012345678901",
    ipfsHash: "QmMock2HashXYZ789",
    createdAt: daysAgo(15),
    expiresAt: daysFromNow(15),
    isForever: false,
    exists: true,
    message:
      "Sometimes the best ideas come when you least expect them. Keep floating! ✨",
    userId: "user-bob",
    type: "bottle",
    timestamp: daysAgo(15).getTime(),
    likeCount: 45,
    commentCount: 8,
  },
  {
    id: 3,
    creator: "0x3456789012345678901234567890123456789012",
    ipfsHash: "QmMock3HashPQR456",
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(28),
    isForever: false,
    exists: true,
    message:
      "To whoever finds this: you are loved, you are enough, you matter. 💙",
    userId: "user-charlie",
    type: "bottle",
    timestamp: daysAgo(2).getTime(),
    likeCount: 156,
    commentCount: 23,
  },
  {
    id: 4,
    creator: "0x4567890123456789012345678901234567890123",
    ipfsHash: "QmMock4HashLMN789",
    createdAt: daysAgo(20),
    expiresAt: daysFromNow(10),
    isForever: false,
    exists: true,
    message: "Had the best coffee today. Life is good in the small moments. ☕",
    userId: "user-diana",
    type: "bottle",
    timestamp: daysAgo(20).getTime(),
    likeCount: 8,
    commentCount: 1,
  },
  {
    id: 5,
    creator: "0x5678901234567890123456789012345678901234",
    ipfsHash: "QmMock5HashUVW123",
    createdAt: daysAgo(28),
    expiresAt: daysFromNow(2),
    isForever: false,
    exists: true,
    message:
      "This bottle expires soon! Quick, someone save it with engagement! 🆘",
    userId: "user-eve",
    type: "bottle",
    timestamp: daysAgo(28).getTime(),
    likeCount: 89,
    commentCount: 2,
  },
  {
    id: 6,
    creator: "0x6789012345678901234567890123456789012345",
    ipfsHash: "QmMock6HashDEF456",
    createdAt: daysAgo(100),
    expiresAt: daysFromNow(0),
    isForever: true,
    exists: true,
    message:
      "I made it! This message is now FOREVER thanks to your love and comments! 🎉✨",
    userId: "user-frank",
    type: "bottle",
    timestamp: daysAgo(100).getTime(),
    likeCount: 342,
    commentCount: 67,
  },
  {
    id: 7,
    creator: "0x7890123456789012345678901234567890123456",
    ipfsHash: "QmMock7HashGHI789",
    createdAt: daysAgo(8),
    expiresAt: daysFromNow(22),
    isForever: false,
    exists: true,
    message: "Remember: progress over perfection. Every step counts! 🚶‍♀️",
    userId: "user-grace",
    type: "bottle",
    timestamp: daysAgo(8).getTime(),
    likeCount: 27,
    commentCount: 5,
  },
  {
    id: 8,
    creator: "0x8901234567890123456789012345678901234567",
    ipfsHash: "QmMock8HashJKL012",
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(29),
    isForever: false,
    exists: true,
    message:
      "Just discovered this platform. Feels like magic! What a beautiful concept. 🪄",
    userId: "user-henry",
    type: "bottle",
    timestamp: daysAgo(1).getTime(),
    likeCount: 3,
    commentCount: 0,
  },
  {
    id: 9,
    creator: "0x9012345678901234567890123456789012345678",
    ipfsHash: "QmMock9HashMNO345",
    createdAt: daysAgo(12),
    expiresAt: daysFromNow(18),
    isForever: false,
    exists: true,
    message: "Sunset watching never gets old. Grateful for this moment. 🌅",
    userId: "user-iris",
    type: "bottle",
    timestamp: daysAgo(12).getTime(),
    likeCount: 51,
    commentCount: 7,
  },
  {
    id: 10,
    creator: "0x0123456789012345678901234567890123456789",
    ipfsHash: "QmMock10HashPQR678",
    createdAt: daysAgo(6),
    expiresAt: daysFromNow(24),
    isForever: false,
    exists: true,
    message: "Coding at 2am hits different. Send caffeine and good vibes! 💻☕",
    userId: "user-jack",
    type: "bottle",
    timestamp: daysAgo(6).getTime(),
    likeCount: 19,
    commentCount: 4,
  },
];

/**
 * Get random initial position for a bottle
 * Ensures bottles are within ocean bounds with padding
 */
export function getRandomBottlePosition(
  oceanWidth: number,
  oceanHeight: number,
  padding: number = 50,
): { x: number; y: number } {
  return {
    x: padding + Math.random() * (oceanWidth - 2 * padding),
    y: padding + Math.random() * (oceanHeight - 2 * padding),
  };
}

/**
 * Get random velocity for drift
 */
export function getRandomVelocity(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Get random phase offset for bobbing (prevents sync)
 */
export function getRandomPhase(): number {
  return Math.random() * Math.PI * 2;
}
