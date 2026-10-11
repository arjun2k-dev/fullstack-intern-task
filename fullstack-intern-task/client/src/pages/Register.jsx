import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorInfo } from '../api/client';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { Spinner } from '../components/Spinner';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate({ name, email, password, confirmPassword }) {
  const errors = {};
  const trimmedName = name.trim();

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters';
  }
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
      // Registration logs the user in; <GuestRoute> then redirects to the gallery
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (err) {
      const { message, fieldErrors: serverErrors } = getErrorInfo(err);
      setFormError(message);
      setFieldErrors(serverErrors);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save the templates you love and find them later"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert type="error">{formError}</Alert>

        <TextField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          disabled={submitting}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={submitting}
        />
        <TextField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          disabled={submitting}
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
