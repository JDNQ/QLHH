"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700",
        primary: "bg-orange-100 text-primary",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        danger: "bg-danger-light text-danger",
        info: "bg-info-light text-info",
        outline: "border border-neutral-200 text-neutral-600 bg-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "primary" && "bg-primary",
            variant === "info" && "bg-info",
            (!variant || variant === "default") && "bg-neutral-500",
          )}
        />
      )}
      {children}
    </span>
  );
}

export function PostStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> =
    {
      draft: { label: "Ban nhap", variant: "default" },
      pending: { label: "Cho duyet", variant: "warning" },
      approved: { label: "Da duyet", variant: "success" },
      rejected: { label: "Bi tu choi", variant: "danger" },
      expired: { label: "Het han", variant: "default" },
    };
  const { label, variant } = map[status.toLowerCase()] ?? {
    label: status,
    variant: "default",
  };

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
