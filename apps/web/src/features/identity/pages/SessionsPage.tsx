import { useState, useEffect } from 'react';
import { BaseButton } from '../../../components/ui/BaseButton';
// We would import the actual API call here
// import { identityApi } from '../services/identityApi';

export function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking fetch sessions for now
    setTimeout(() => {
      setSessions([
        {
          id: '1',
          ip_address: '192.168.1.1',
          user_agent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          last_active_at: new Date().toISOString(),
          is_current: true,
        },
        {
          id: '2',
          ip_address: '10.0.0.5',
          user_agent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          last_active_at: new Date(Date.now() - 86400000).toISOString(),
          is_current: false,
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRevoke = async (id: string) => {
    // try {
    //   await identityApi.revokeSession(id);
    //   setSessions(sessions.filter(s => s.id !== id));
    // } catch (e) { ... }
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Active Sessions</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
          Review devices that are currently logged into your account.
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--color-neutral-secondary-light)]">
            Loading sessions...
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {session.user_agent.includes('Mobile') ||
                      session.user_agent.includes('iPhone') ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {session.ip_address}
                      {session.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold">
                          Current Device
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1 truncate max-w-md">
                      {session.user_agent}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-muted-light)] mt-1">
                      Last active:{' '}
                      {new Date(session.last_active_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <BaseButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    className="shrink-0"
                  >
                    Revoke Access
                  </BaseButton>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
