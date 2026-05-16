import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { mergeClassName } from "#/lib/merge-class-name";

export interface NavBrandProps {
  className?: string;
}

export function NavBrand({ className }: NavBrandProps) {
  return (
    <Link
      to="/"
      className={mergeClassName(
        "flex items-center gap-2 font-semibold",
        className,
      )}
    >
      <TriangleAlert className="h-5 w-5" />
      <span>Issue Tracker</span>
    </Link>
  );
}
