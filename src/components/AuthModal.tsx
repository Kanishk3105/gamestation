import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { useAppState } from '../state/AppState';

export function AuthModal() {
  const { authOpen, setAuthOpen, refresh } = useAppState();
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
  const [destination, setDestination] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  const close = () => {
    setAuthOpen(false);
    setError('');
    setCode('');
    setChallengeId('');
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div className="gs-overlay gs-overlay-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="gs-modal"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <button className="gs-icon-btn gs-modal-close" onClick={close} aria-label="Close sign in">×</button>
            <h2 id="auth-title">Sign in to continue</h2>
            <p className="gs-muted">Email or phone OTP, verified by the GameStation API.</p>
            <div className="gs-segment">
              <button className={channel === 'email' ? 'is-on' : ''} onClick={() => setChannel('email')}>Email OTP</button>
              <button className={channel === 'phone' ? 'is-on' : ''} onClick={() => setChannel('phone')}>Phone OTP</button>
            </div>
            <label>
              {channel === 'email' ? 'Email' : 'Mobile'}
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={channel === 'email' ? 'you@studio.com' : '9876543210'}
                autoComplete={channel === 'email' ? 'email' : 'tel'}
              />
            </label>
            <button
              className="gs-btn gs-btn-ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  const result = channel === 'email'
                    ? await api.requestEmailOtp(destination)
                    : await api.requestPhoneOtp(destination);
                  setChallengeId(result.challengeId);
                  setHint(result.provider === 'development'
                    ? 'Development OTP dispatched. Use 246810 if OTP_DEV_CODE is set, or read the API server log.'
                    : `Code sent via ${result.provider}.`);
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Unable to send OTP');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Request OTP
            </button>
            {challengeId && (
              <label>
                6-digit code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </label>
            )}
            {hint && <p className="gs-hint">{hint}</p>}
            {error && <p className="gs-error" role="alert">{error}</p>}
            <button
              className="gs-btn gs-btn-primary"
              disabled={busy || !challengeId || code.length !== 6}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  if (channel === 'email') await api.verifyEmailOtp(challengeId, code);
                  else await api.verifyPhoneOtp(challengeId, code);
                  await refresh();
                  close();
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Verification failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Verify & continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
