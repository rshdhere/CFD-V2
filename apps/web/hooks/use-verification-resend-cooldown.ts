import { useEffect, useState } from "react";

export const VERIFICATION_RESEND_COOLDOWN_SEC = 60;

export function formatVerificationResendCountdown(
  totalSeconds: number,
): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * After the server sends the initial verification email, blocks resend for
 * {@link VERIFICATION_RESEND_COOLDOWN_SEC} seconds (restarts when `verificationEmail` changes).
 */
export function useVerificationResendCooldown(
  verificationEmail: string | null,
): { secondsLeft: number; isCooldownActive: boolean } {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!verificationEmail) {
      setSecondsLeft(0);
      return;
    }

    setSecondsLeft(VERIFICATION_RESEND_COOLDOWN_SEC);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [verificationEmail]);

  return {
    secondsLeft,
    isCooldownActive: secondsLeft > 0,
  };
}
