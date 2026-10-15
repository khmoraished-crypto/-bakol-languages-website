"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
  counter,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  counter?: { value: number; max: number };
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          )}
          {required && <span className="sr-only">(مطلوب)</span>}
        </Label>
        {counter && (
          <span className={cn("text-[11px] tabular-nums", counter.value > counter.max ? "text-destructive" : "text-muted-foreground")}>
            {counter.value.toLocaleString("ar")} / {counter.max.toLocaleString("ar")}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Single-choice segmented control rendered as a radio group. */
export function ChoiceGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 3,
  ariaLabel,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: Record<T, string>;
  columns?: 2 | 3 | 4 | 5;
  ariaLabel: string;
}) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", 5: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" }[columns];
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("grid gap-2", cols)}>
      {(Object.entries(options) as Array<[T, string]>).map(([key, label]) => {
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            name={name}
            onClick={() => onChange(key)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "border-accent bg-accent-soft text-teal-800 shadow-[0_0_0_3px_rgb(20_184_166_/_0.12)]"
                : "border-input bg-white text-muted-foreground hover:border-accent/40 hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-choice chips. */
export function MultiChoice<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  options: Record<T, string>;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {(Object.entries(options) as Array<[T, string]>).map(([key, label]) => {
        const active = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== key) : [...value, key])}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-all",
              active
                ? "border-accent bg-accent text-white shadow-soft"
                : "border-input bg-white text-muted-foreground hover:border-accent/40 hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function FormSection({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-xs font-semibold tracking-wide text-muted-foreground">{title}</legend>
        {aside}
      </div>
      {children}
    </fieldset>
  );
}
