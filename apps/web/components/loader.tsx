"use client";

type FastLoaderProps = {
  content?: string;
};

export function FastLoader({ content = "Loading..." }: FastLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 text-neutral-900 dark:text-neutral-300"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-900 [animation-duration:400ms] dark:border-neutral-700 dark:border-t-neutral-300"
      />
      <span className="text-sm">{content}</span>
    </div>
  );
}
