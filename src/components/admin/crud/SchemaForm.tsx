'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'textarea'
  | 'boolean'
  | 'date';

export interface FormFieldDef {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  readOnly?: boolean;
}

interface SchemaFormProps<T> {
  fields: FormFieldDef[];
  schema: z.ZodType<any>;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export function SchemaForm<T extends Record<string, any>>({
  fields,
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  isLoading = false,
  title,
  subtitle,
}: SchemaFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      init[f.name] = initialValues[f.name] ?? (f.type === 'boolean' ? false : '');
    });
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const init: Record<string, any> = {};
      fields.forEach((f) => {
        init[f.name] = initialValues[f.name] ?? (f.type === 'boolean' ? false : '');
      });
      setFormData(init);
      setIsDirty(false);
    }
  }, [initialValues?.id]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    // Clean empty strings for number/optional fields so Zod defaults and coerce work properly
    const cleanedData: Record<string, any> = { ...formData };
    fields.forEach((f) => {
      if (cleanedData[f.name] === '') {
        if (f.type === 'number') {
          delete cleanedData[f.name];
        } else if (!f.required) {
          delete cleanedData[f.name];
        }
      }
    });

    // Validate with Zod
    const validation = schema.safeParse(cleanedData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const zodErrors = validation.error.flatten().fieldErrors;
      for (const [key, messages] of Object.entries(zodErrors)) {
        if (messages && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      }
      setErrors(fieldErrors);
      setGlobalError('Veuillez corriger les champs en surbrillance rouge ci-dessous.');
      return;
    }

    try {
      await onSubmit(validation.data as T);
      setIsDirty(false);
    } catch (err: any) {
      setGlobalError(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {title && (
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {globalError && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{globalError}</span>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((f) => {
          const value = formData[f.name] ?? '';
          const hasError = !!errors[f.name];

          return (
            <div key={f.name} className="space-y-1.5">
              <label
                htmlFor={`field-${f.name}`}
                className="block text-xs font-bold text-neutral-300"
              >
                {f.label}
                {f.required && <span className="text-amber-400 ml-1">*</span>}
              </label>

              {/* Render input based on type */}
              {f.type === 'textarea' ? (
                <textarea
                  id={`field-${f.name}`}
                  rows={f.rows || 3}
                  value={value}
                  readOnly={f.readOnly}
                  placeholder={f.placeholder}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className={`w-full px-3 py-2 bg-[#081524] border rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-colors ${
                    hasError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-white/15 focus:border-amber-400'
                  } ${f.readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              ) : f.type === 'select' ? (
                <select
                  id={`field-${f.name}`}
                  value={value}
                  disabled={f.readOnly}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className={`w-full px-3 py-2 bg-[#081524] border rounded-xl text-xs text-white outline-none transition-colors ${
                    hasError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-white/15 focus:border-amber-400'
                  }`}
                >
                  <option value="">Sélectionner une option...</option>
                  {f.options?.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : f.type === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id={`field-${f.name}`}
                    checked={Boolean(value)}
                    disabled={f.readOnly}
                    onChange={(e) => handleChange(f.name, e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs text-neutral-300">
                    {f.placeholder || 'Activer cette option'}
                  </span>
                </label>
              ) : (
                <input
                  id={`field-${f.name}`}
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={value}
                  readOnly={f.readOnly}
                  placeholder={f.placeholder}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) =>
                    handleChange(
                      f.name,
                      f.type === 'number'
                        ? e.target.value === ''
                          ? ''
                          : Number(e.target.value)
                        : e.target.value
                    )
                  }
                  className={`w-full px-3 py-2 bg-[#081524] border rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-colors ${
                    hasError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-white/15 focus:border-amber-400'
                  } ${f.readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              )}

              {/* Helper text or error */}
              {hasError ? (
                <p className="text-2xs text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors[f.name]}</span>
                </p>
              ) : f.helperText ? (
                <p className="text-2xs text-neutral-400">{f.helperText}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}
