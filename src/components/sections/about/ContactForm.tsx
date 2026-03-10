"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/cn";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 inline-block"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

export function ContactForm() {
  const t = useTranslations("about.contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const inputClasses = cn(
    "w-full px-4 py-3 rounded-xl text-sm",
    "bg-[var(--151-bg-elevated)] border border-[var(--151-border-subtle)]",
    "text-[var(--151-text-primary)] placeholder:text-[var(--151-text-muted)]",
    "focus:outline-none focus:border-[var(--151-magenta-500)] focus:ring-2 focus:ring-[var(--151-magenta-500)]/25",
    "transition-[border-color,box-shadow] duration-200"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("name")}
        </label>
        <input
          id="name"
          type="text"
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={errors.name ? "true" : undefined}
          {...register("name")}
          className={cn(inputClasses, errors.name && "border-red-500")}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-xs text-red-400">
            {t("validation.name")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={errors.email ? "true" : undefined}
          {...register("email")}
          className={cn(inputClasses, errors.email && "border-red-500")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
            {t("validation.email")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("company")}
        </label>
        <input
          id="company"
          type="text"
          {...register("company")}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("message")}
        </label>
        <textarea
          id="message"
          rows={5}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={errors.message ? "true" : undefined}
          {...register("message")}
          className={cn(inputClasses, "resize-none", errors.message && "border-red-500")}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-xs text-red-400">
            {t("validation.message")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-glass-primary w-full"
      >
        {status === "sending" ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            {t("send")}
          </span>
        ) : (
          t("send")
        )}
      </button>

      {status === "success" && (
        <p className="text-sm text-emerald-500 text-center" role="status">{t("success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500 text-center" role="alert">{t("error")}</p>
      )}
    </form>
  );
}
