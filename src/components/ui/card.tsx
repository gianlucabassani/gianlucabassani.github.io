import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  // Determine hover theme based on className keywords
  let hoverTheme = "var(--primary)"; // default magenta/pink
  
  if (className?.includes("theme-purple")) {
    hoverTheme = "var(--theme-purple)";
  } else if (className?.includes("theme-green")) {
    hoverTheme = "var(--theme-green)";
  } else if (className?.includes("theme-blue")) {
    hoverTheme = "var(--theme-blue)";
  } else if (className?.includes("theme-yellow")) {
    hoverTheme = "var(--theme-yellow)";
  } else if (className?.includes("theme-orange")) {
    hoverTheme = "var(--theme-orange)";
  } else if (className?.includes("success")) {
    hoverTheme = "var(--success)"; // Mint Green
  } else if (className?.includes("warning")) {
    hoverTheme = "var(--warning)"; // Sunset Orange
  } else if (className?.includes("secondary") || className?.includes("cyan")) {
    hoverTheme = "var(--secondary)"; // Neon Cyan
  } else if (className?.includes("accent") || className?.includes("violet") || className?.includes("purple")) {
    hoverTheme = "var(--accent)"; // Electric Violet
  } else if (className?.includes("destructive")) {
    hoverTheme = "var(--destructive)"; // Red/Magenta
  }

  // Merge the hover theme into inline style
  const mergedStyle = {
    "--hover-theme": hoverTheme,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      style={mergedStyle}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
