import { Link } from 'react-router-dom';
import { ShieldAlert, FileQuestion, ServerCrash, HardHat } from 'lucide-react';
import { BaseButton } from '../components/ui/BaseButton';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight font-sans">404</h1>
      <h2 className="text-lg font-bold">Page Not Found</h2>
      <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="w-full mt-4">
        <BaseButton variant="primary" className="w-full cursor-pointer">
          Return Home
        </BaseButton>
      </Link>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center shrink-0">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight font-sans">403</h1>
      <h2 className="text-lg font-bold">Access Forbidden</h2>
      <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
        You do not have the credentials or privileges required to access this resource context.
      </p>
      <Link to="/" className="w-full mt-4">
        <BaseButton variant="primary" className="w-full cursor-pointer">
          Return Home
        </BaseButton>
      </Link>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center shrink-0">
        <ServerCrash size={32} />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight font-sans">500</h1>
      <h2 className="text-lg font-bold">Internal Server Error</h2>
      <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
        An unexpected error occurred on our end. Rest assured, our engineering team has been notified.
      </p>
      <Link to="/" className="w-full mt-4">
        <BaseButton variant="primary" className="w-full cursor-pointer">
          Return Home
        </BaseButton>
      </Link>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 gap-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
        <HardHat size={32} />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight font-sans">Under Maintenance</h1>
      <h2 className="text-base font-bold text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">System Upgrades in Progress</h2>
      <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
        We are executing scheduled platform upgrades. We will be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
}
