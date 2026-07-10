import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ShieldCheck,
  Copy,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { BaseCard } from '../components/ui/BaseCard';
import { BaseButton } from '../components/ui/BaseButton';
import { BaseInput } from '../components/ui/BaseInput';
import { BaseBadge } from '../components/ui/BaseBadge';

export default function VotingPage() {
  const [step, setStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState('');

  const candidates = [
    {
      id: 'cand-1',
      name: 'Jane Doe',
      party: 'Student Progress Party',
      quote: 'Building the future, together.',
    },
    {
      id: 'cand-2',
      name: 'John Doe',
      party: 'Democratic Coalition',
      quote: 'Representation you can count on.',
    },
  ];

  const steps = [
    { number: 1, label: 'Authentication' },
    { number: 2, label: 'Selections' },
    { number: 3, label: 'Review' },
    { number: 4, label: 'Receipt' },
  ];

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto py-4">
      {/* Timeline Steps Indicator */}
      <section className="flex items-center justify-between border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] pb-6 select-none">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s.number
                    ? 'bg-primary text-white'
                    : 'bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] text-zinc-400'
                }`}
              >
                {step > s.number ? <Check size={12} /> : s.number}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  step === s.number
                    ? 'text-primary block'
                    : 'text-zinc-400 hidden sm:block'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${step > s.number ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}
              />
            )}
          </React.Fragment>
        ))}
      </section>

      {/* Main Ballot Card */}
      <section className="flex-1">
        {/* Step 1: Authentication */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold font-sans">
                Voter Authentication
              </h2>
              <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
                Enter your unique voter identifier to receive an authentication
                OTP token.
              </p>
            </div>

            <BaseCard className="flex flex-col gap-4">
              <BaseInput
                label="Voter ID"
                placeholder="e.g. 20394821"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
              />
              <BaseInput
                label="SMS One-Time Password (OTP)"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <BaseButton
                disabled={!voterId || !otp}
                variant="primary"
                className="mt-2 w-full"
                onClick={handleNextStep}
              >
                Verify Credentials <ArrowRight size={16} className="ml-1" />
              </BaseButton>
            </BaseCard>
          </motion.div>
        )}

        {/* Step 2: Selections */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div>
              <BaseBadge variant="primary" className="mb-2">
                Module A: Student Elections
              </BaseBadge>
              <h2 className="text-xl font-bold font-sans">
                SRC Presidential Election 2026
              </h2>
              <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
                Select exactly one candidate from the choices below.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand.id)}
                  className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer select-none transition-all ${
                    selectedCandidate === cand.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B] hover:border-primary/50'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold">{cand.name}</h3>
                    <p className="text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-0.5">
                      {cand.party}
                    </p>
                    <p className="text-xs italic text-[var(--color-neutral-muted-light)] mt-2">
                      &ldquo;{cand.quote}&rdquo;
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedCandidate === cand.id
                        ? 'bg-primary border-primary text-white'
                        : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {selectedCandidate === cand.id && <Check size={12} />}
                  </div>
                </div>
              ))}

              <BaseButton
                disabled={!selectedCandidate}
                variant="primary"
                className="mt-4 w-full"
                onClick={handleNextStep}
              >
                Review Selection <ArrowRight size={16} className="ml-1" />
              </BaseButton>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold font-sans">
                Review Your Ballot
              </h2>
              <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
                Verify your selection before casting. Ballots cannot be modified
                once submitted.
              </p>
            </div>

            <BaseCard className="flex flex-col gap-4 border-primary bg-primary/5">
              <div className="flex justify-between items-start pb-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Office Category
                  </span>
                  <h3 className="text-sm font-bold mt-0.5">SRC President</h3>
                </div>
                <BaseBadge variant="success">Verified Option</BaseBadge>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Chosen Candidate
                </span>
                <h3 className="text-lg font-bold text-primary mt-0.5">
                  {candidates.find((c) => c.id === selectedCandidate)?.name}
                </h3>
                <p className="text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                  {candidates.find((c) => c.id === selectedCandidate)?.party}
                </p>
              </div>
            </BaseCard>

            <div className="flex gap-4">
              <BaseButton
                variant="secondary"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Back
              </BaseButton>
              <BaseButton
                variant="primary"
                className="flex-1 cursor-pointer"
                onClick={handleNextStep}
              >
                Cast Ballot
              </BaseButton>
            </div>
          </motion.div>
        )}

        {/* Step 4: Receipt */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-xl font-bold font-sans mt-2">
                Ballot Cast Successfully!
              </h2>
              <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] max-w-md">
                Your vote has been cryptographically signed and stored in the
                ledger. Copy your receipt hash to verify it later.
              </p>
            </div>

            <BaseCard className="flex flex-col gap-4 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>Verification Hash Receipt</span>
                </div>
                <button
                  onClick={() => alert('Copied receipt hash!')}
                  className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <Copy size={12} /> Copy Code
                </button>
              </div>

              <div className="p-3 bg-zinc-950 dark:bg-black text-[var(--color-canvas-light)] rounded-xl font-mono text-[10px] break-all leading-relaxed select-all">
                sha256-83ab7f297b875ac81dcd02e9cf93e89a3d4f828a2a893cb9cf28daefcf19b93e
              </div>
            </BaseCard>

            <BaseButton
              variant="primary"
              className="w-full mt-2 cursor-pointer"
              onClick={() => setStep(1)}
            >
              Finish and Exit
            </BaseButton>
          </motion.div>
        )}
      </section>
    </div>
  );
}
