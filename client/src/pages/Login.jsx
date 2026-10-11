import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getErrorInfo } from '../api/client';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { Spinner } from '../components/Spinner';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate({ email, password }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const notice = location.state?.notice;

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      // On success AuthContext updates and <GuestRoute> redirects to the intended page
      await login({ email: form.email.trim(), password: form.password });
    } catch (err) {
      const { message, fieldErrors: serverErrors } = getErrorInfo(err);
      setFormError(message);
      setFieldErrors(serverErrors);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your favorite templates"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {notice && !formError && <Alert type="info">{notice}</Alert>}
        <Alert type="error">{formError}</Alert>

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={submitting}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={submitting}
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}
