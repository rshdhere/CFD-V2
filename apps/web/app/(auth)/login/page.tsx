"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  formatVerificationResendCountdown,
  useVerificationResendCooldown,
} from "@/hooks/use-verification-resend-cooldown";
import { useTRPC } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, type SignUpSchema } from "@CFD-V2/validators";

export default function SignUp() {
  const trpc = useTRPC();
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const [isResendConsumed, setIsResendConsumed] = useState(false);
  const { secondsLeft, isCooldownActive } =
    useVerificationResendCooldown(verificationEmail);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(authSchema.input),
  });

  const signupMutation = useMutation(trpc.v1.user.login.mutationOptions());
  const resendVerificationMutation = useMutation(
    trpc.v1.user.resendVerificationEmail.mutationOptions(),
  );

  const onSubmit = (data: SignUpSchema) => {
    signupMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setVerificationEmail(data.email);
        setIsResendConsumed(false);
        resendVerificationMutation.reset();
      },
    });
  };

  const resendVerificationEmail = () => {
    if (!verificationEmail || isResendConsumed || isCooldownActive) {
      return;
    }

    resendVerificationMutation.mutate(
      {
        email: verificationEmail,
      },
      {
        onSuccess: () => {
          setIsResendConsumed(true);
        },
        onError: (error) => {
          if (error.message.includes("only once")) {
            setIsResendConsumed(true);
          }
        },
      },
    );
  };

  if (verificationEmail) {
    return (
      <div className="flex w-full max-w-md flex-col gap-y-3 rounded border border-neutral-300 bg-white p-6 text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          We sent a magic link to{" "}
          <span className="font-medium">{verificationEmail}</span>.
        </p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Didn't receive the magic link yet?
        </p>
        <button
          type="button"
          onClick={resendVerificationEmail}
          disabled={
            resendVerificationMutation.isPending ||
            isResendConsumed ||
            isCooldownActive
          }
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-emerald-400 py-2 text-neutral-900 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {resendVerificationMutation.isPending ? (
            "Sending verification email..."
          ) : isResendConsumed ? (
            <>
              <Check className="size-4" />
              Verification email sent
            </>
          ) : isCooldownActive ? (
            `Resend in ${formatVerificationResendCountdown(secondsLeft)}`
          ) : (
            "Resend verification email"
          )}
        </button>
        {resendVerificationMutation.error && (
          <p className="text-sm text-red-500">
            {resendVerificationMutation.error.message}
          </p>
        )}
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Resend unlocks after one minute. You can use it only once.
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          You can close this page after verifying your email.
        </p>
        <Link href="/signin" className="text-sm text-emerald-500 underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-y-2"
    >
      <input
        {...register("email")}
        type="email"
        maxLength={32}
        placeholder="email"
        className="rounded px-4 py-2.5 outline-none selection:bg-emerald-300"
      />
      {errors.email && (
        <p className="text-red-500">{`${errors.email.message}`}</p>
      )}
      <input
        {...register("password")}
        type="password"
        maxLength={24}
        placeholder="password"
        className="rounded px-4 py-2.5 outline-none selection:bg-emerald-300"
      />
      {errors.password && (
        <p className="text-red-500">{`${errors.password.message}`}</p>
      )}
      <button
        disabled={signupMutation.isPending}
        type="submit"
        className="cursor-pointer rounded bg-emerald-400 py-2 text-neutral-900 disabled:bg-gray-300"
      >
        Submit
      </button>
      {signupMutation.error && (
        <p className="text-red-500">{signupMutation.error.message}</p>
      )}
    </form>
  );
}
