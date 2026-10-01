"use client";

import React from "react";
import {
  Controller,
  Control,
  FieldValues,
  FieldPath,
  ControllerRenderProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (field: ControllerRenderProps<TFieldValues, TName>) => React.ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  required,
  className,
  children,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", className)}>
          {label && (
            <Label htmlFor={name} className="text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {children(field)}
          {description && !fieldState.error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {fieldState.error && (
            <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
