'use client';

import { useEffect } from 'react';
import type { Bottle } from '@loscolmebrothers/forever-message-types';
import { UI_COLORS } from '@/lib/constants';

interface BottleModalProps {
  bottle: Bottle | null;
  onClose: () => void;
}

/**
 * BottleModal Component
 * Displays bottle message and metadata in an overlay modal
 */
export function BottleModal({ bottle, onClose }: BottleModalProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (bottle) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [bottle, onClose]);

  // Don't render if no bottle selected
  if (!bottle) {
    return null;
  }

  // Calculate days until expiration
  const daysUntilExpiration = bottle.isForever
    ? Infinity
    : Math.ceil((bottle.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const isExpiringSoon = daysUntilExpiration <= 3 && !bottle.isForever;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: UI_COLORS.BACKDROP,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: UI_COLORS.MODAL_BACKGROUND,
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: `0 8px 32px ${UI_COLORS.SHADOW}`,
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: `1px solid #E5E7EB`,
            position: 'relative',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: UI_COLORS.TEXT_PRIMARY,
              paddingRight: '40px',
            }}
          >
            Message in a Bottle {bottle.isForever && '✨'}
          </h2>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: UI_COLORS.TEXT_SECONDARY,
              padding: '4px 8px',
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Message Content */}
        <div style={{ padding: '24px' }}>
          <p
            style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: UI_COLORS.TEXT_PRIMARY,
              margin: '0 0 24px 0',
              whiteSpace: 'pre-wrap',
            }}
          >
            {bottle.message}
          </p>

          {/* Metadata */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
            }}
          >
            {/* Posted Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_SECONDARY }}>
                📅 Posted:
              </span>
              <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_PRIMARY }}>
                {bottle.createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Expiration Status */}
            {bottle.isForever ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_SECONDARY }}>
                  ⏳ Status:
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#10B981',
                  }}
                >
                  FOREVER ✨ (100+ likes & 4+ comments)
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_SECONDARY }}>
                  ⏳ Expires in:
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: isExpiringSoon ? 'bold' : 'normal',
                    color: isExpiringSoon ? '#EF4444' : UI_COLORS.TEXT_PRIMARY,
                  }}
                >
                  {daysUntilExpiration > 0
                    ? `${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`
                    : 'Expired'}
                  {isExpiringSoon && ' ⚠️'}
                </span>
              </div>
            )}

            {/* Engagement Stats */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                paddingTop: '8px',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>❤️</span>
                <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_PRIMARY }}>
                  {bottle.likeCount} {bottle.likeCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>💬</span>
                <span style={{ fontSize: '14px', color: UI_COLORS.TEXT_PRIMARY }}>
                  {bottle.commentCount} {bottle.commentCount === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (future: action buttons) */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: UI_COLORS.TEXT_SECONDARY,
              textAlign: 'center',
            }}
          >
            Phase 1 MVP - Like and comment features coming soon!
          </p>
        </div>
      </div>

      {/* Inline animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
