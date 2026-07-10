import { Outlet } from 'react-router-dom';

export default function ErrorLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <Outlet />
      </div>
      <footer className="w-full py-6 text-center border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B]">
        <p className="text-[11px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1.5px]">
          Powered by{' '}
          <span className="font-semibold text-primary">VeroSeven</span>
        </p>
      </footer>
    </div>
  );
}
