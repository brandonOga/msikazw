import { Link } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  className?: string;
}

export function Breadcrumbs({ crumbs, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 flex-wrap ${className}`}>
      <Link
        to="/"
        className="flex items-center text-gray-400 hover:text-[#009739] transition-colors shrink-0"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            {isLast || !crumb.href ? (
              <span
                className="text-gray-800 truncate max-w-[200px]"
                style={{ fontSize: '0.78rem', fontWeight: isLast ? 600 : 400 }}
                aria-current={isLast ? 'page' : undefined}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-gray-500 hover:text-[#009739] transition-colors truncate max-w-[200px]"
                style={{ fontSize: '0.78rem' }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
