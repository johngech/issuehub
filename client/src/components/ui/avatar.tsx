import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
} from "react";
import { mergeClassName } from "#/lib/merge-class-name";

const avatarSizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export interface AvatarProps extends ComponentPropsWithoutRef<typeof Root> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: keyof typeof avatarSizes;
}

const Avatar = forwardRef<ComponentRef<typeof Root>, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    return (
      <Root
        ref={ref}
        className={mergeClassName(
          "relative flex shrink-0 cursor-pointer overflow-hidden rounded-full bg-muted",
          avatarSizes[size],
          className,
        )}
        aria-label={alt || fallback || "Avatar"}
        {...props}
      >
        {src && (
          <Image
            src={src}
            alt={alt || ""}
            className="aspect-square h-full w-full"
          />
        )}
        <Fallback
          className={mergeClassName(
            "flex h-full w-full items-center justify-center rounded-full text-muted-foreground",
            avatarSizes[size],
          )}
        >
          {fallback}
        </Fallback>
      </Root>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
