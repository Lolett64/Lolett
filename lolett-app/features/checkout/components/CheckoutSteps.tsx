'use client';

interface CheckoutStepsProps {
  currentStep: number; // 1, 2, or 3
}

const steps = [
  { number: 1, label: 'Livraison' },
  { number: 2, label: 'Paiement' },
  { number: 3, label: 'Confirmation' },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 48, gap: 0 }}>
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  ...(isCompleted
                    ? { backgroundColor: '#C4956A', color: '#fff', border: '2px solid #C4956A' }
                    : isCurrent
                      ? { backgroundColor: '#C4956A', color: '#fff', border: '2px solid #C4956A' }
                      : { backgroundColor: 'transparent', color: '#9B8E82', border: '2px solid #E8E0D6' }),
                }}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                  color: isCurrent || isCompleted ? '#2C2420' : '#9B8E82',
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  width: 80,
                  height: 1,
                  marginLeft: 12,
                  marginRight: 12,
                  marginBottom: 20,
                  backgroundColor: isCompleted ? '#C4956A' : '#E8E0D6',
                  transition: 'background-color 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
