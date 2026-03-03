'use client';

import { SuccessStyles } from './SuccessStyles';

export function SuccessSkeleton() {
  return (
    <>
      <SuccessStyles />
      <div className="ckv-page">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px', textAlign: 'center' as const }}>

          {/* Skeleton checkmark circle */}
          <div style={{ width: 72, height: 72, margin: '0 auto' }}>
            <div className="ckv-shimmer" style={{ width: 72, height: 72, borderRadius: '50%' }} />
          </div>

          {/* Skeleton title */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
            <div className="ckv-shimmer" style={{ width: 220, height: 22, borderRadius: 6 }} />
            <div className="ckv-shimmer" style={{ width: 160, height: 14, borderRadius: 6 }} />
          </div>

          {/* Skeleton order number pill */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <div className="ckv-shimmer" style={{ width: 180, height: 38, borderRadius: 50 }} />
          </div>

          {/* Skeleton recap card */}
          <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {/* Item rows */}
            {[0, 1].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid #F0EBE4' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                  <div className="ckv-shimmer" style={{ width: 140, height: 12, borderRadius: 4 }} />
                  <div className="ckv-shimmer" style={{ width: 90, height: 10, borderRadius: 4 }} />
                </div>
                <div className="ckv-shimmer" style={{ width: 50, height: 12, borderRadius: 4 }} />
              </div>
            ))}

            <div style={{ height: 1, background: '#E8E0D6', margin: '16px 0' }} />

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="ckv-shimmer" style={{ width: 70, height: 12, borderRadius: 4 }} />
                <div className="ckv-shimmer" style={{ width: 60, height: 12, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="ckv-shimmer" style={{ width: 60, height: 12, borderRadius: 4 }} />
                <div className="ckv-shimmer" style={{ width: 50, height: 12, borderRadius: 4 }} />
              </div>
            </div>

            <div style={{ height: 1, background: '#E8E0D6', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="ckv-shimmer" style={{ width: 50, height: 16, borderRadius: 4 }} />
              <div className="ckv-shimmer" style={{ width: 80, height: 16, borderRadius: 4 }} />
            </div>
          </div>

          {/* Skeleton buttons */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column' as const, gap: 12, alignItems: 'center' }}>
            <div className="ckv-shimmer" style={{ width: 320, maxWidth: '100%', height: 48, borderRadius: 50 }} />
            <div className="ckv-shimmer" style={{ width: 320, maxWidth: '100%', height: 48, borderRadius: 50 }} />
          </div>
        </div>
      </div>
    </>
  );
}
