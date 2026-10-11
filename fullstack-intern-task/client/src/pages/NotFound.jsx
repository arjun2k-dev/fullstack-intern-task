import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      title="404 - Page not found"
      description="The page you are looking for does not exist or has been moved."
    >
      <Link to="/templates" className="btn-primary">
        Back to templates
      </Link>
    </EmptyState>
  );
}
