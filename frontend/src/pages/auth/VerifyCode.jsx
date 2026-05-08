import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import '../../styles/auth.scss';

function VerifyCode() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const inputRefs = useRef([]);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [state]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...pasted.split(''), ...Array(6 - pasted.length).fill('')];
    setCode(next);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = code.join('');
    if (token.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      // Use the OTP entered by the user
      const result = await AuthService.verifyResetToken(token);
      if (result.success) {
        navigate('/auth/reset-password', { state: { token, email: state?.email } });
      } else {
        setError(result.error || 'Invalid or expired code.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!state?.email) return;
    setResendLoading(true);
    try {
      await AuthService.requestPasswordReset(state.email);
      setResendMsg('A new code has been sent!');
      setTimeout(() => setResendMsg(''), 3000);
    } catch {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-card__title">Enter Verification Code</h1>
        <p className="auth-card__subtitle">
          We've sent a 6-digit code to your email. Please enter it below.
        </p>

        {error && <div className="auth-error" style={{ textAlign: 'left' }}>{error}</div>}
        {resendMsg && <div className="alert-success" style={{ padding: '0.625rem 1rem', borderRadius: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.75rem', background: '#D1FAE5', color: '#065F46' }}>{resendMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {code.map((val, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`otp-input${val ? ' filled' : ''}`}
              />
            ))}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resendLoading}
          style={{ background: 'none', border: 'none', color: '#2D3DC0', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, marginTop: '1rem', display: 'block', width: '100%' }}
        >
          {resendLoading ? 'Sending…' : 'Resend Code'}
        </button>

        <Link to="/auth/forgot-password" className="auth-back-link" style={{ justifyContent: 'center' }}>
          ← Back to Forgot Password
        </Link>
      </div>
    </div>
  );
}

export default VerifyCode;
