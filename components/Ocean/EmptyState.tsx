'use client';

/**
 * EmptyState Component
 * Displayed when there are no bottles in the ocean
 */
export function EmptyState() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, #87CEEB, #4682B4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '40px',
        textAlign: 'center',
        zIndex: 100,
      }}
    >
      <div style={{ fontSize: '96px', marginBottom: '30px' }}>🍾</div>
      <h2
        style={{
          margin: 0,
          marginBottom: '15px',
          fontSize: '32px',
          fontWeight: 'bold',
        }}
      >
        The ocean is empty
      </h2>
      <p style={{ margin: 0, fontSize: '18px', maxWidth: '500px', opacity: 0.9 }}>
        No bottles have been cast into the digital ocean yet.
        <br />
        Check back soon!
      </p>
    </div>
  );
}
