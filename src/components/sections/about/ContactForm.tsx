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
    "transition-all duration-200"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("name")}
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={cn(inputClasses, errors.name && "border-red-500")}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--151-text-secondary)] mb-1.5">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={cn(inputClasses, errors.email && "border-red-500")}
        />
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
          {...register("message")}
          className={cn(inputClasses, "resize-none", errors.message && "border-red-500")}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className={cn(
          "w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
          "text-white bg-[var(--151-magenta-500)] hover:bg-[var(--151-magenta-400)]",
          "shadow-[0_0_20px_var(--151-glow-magenta)] hover:shadow-[0_0_30px_var(--151-glow-magenta)]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {status === "sending" ? "..." : t("send")}
      </button>

      {status === "success" && (
        <p className="text-sm text-[var(--151-teal-500)] text-center">{t("success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500 text-center">{t("error")}</p>
      )}
    </form>
  );
}
