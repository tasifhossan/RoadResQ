"use client";

import * as React from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/keys";
import { ROLE_HOME_MAP } from "@/lib/auth/constants";
import { Role } from "@/lib/api/types";

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface IdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
}

interface GsiButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string | number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: IdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
  prompt?: () => void;
}

interface GoogleGlobal {
  accounts?: {
    id?: GoogleAccountsId;
  };
}

export function GoogleSignInButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize scriptLoaded state checking if window.google is already loaded
  const [scriptLoaded, setScriptLoaded] = React.useState(() => {
    if (typeof window !== "undefined") {
      const google = (window as unknown as { google?: GoogleGlobal }).google;
      return !!google?.accounts?.id;
    }
    return false;
  });
  const [scriptError, setScriptError] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const getValidRedirectPath = React.useCallback(
    (userRole: Role): string => {
      const rawNext = searchParams.get("next");
      const defaultHome = ROLE_HOME_MAP[userRole] || "/";

      if (!rawNext) return defaultHome;

      // Must be a relative path starting with a single '/' and not '//'
      if (!rawNext.startsWith("/") || rawNext.startsWith("//")) {
        return defaultHome;
      }

      // Must belong to the user's role prefix
      const expectedPrefix = ROLE_HOME_MAP[userRole];
      if (
        expectedPrefix &&
        (rawNext === expectedPrefix || rawNext.startsWith(expectedPrefix + "/"))
      ) {
        return rawNext;
      }

      return defaultHome;
    },
    [searchParams]
  );

  const handleCredentialResponse = React.useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        toast.error("Google authentication failed. No token received.");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          const user = result.data.user;
          // Invalidate session query
          await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
          await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

          toast.success(`Welcome, ${user.name || "User"}!`);
          const targetPath = getValidRedirectPath(user.role as Role);
          router.replace(targetPath);
          router.refresh();
        } else {
          const status = res.status;
          if (status === 403) {
            const msg = (result.message || "").toLowerCase();
            if (msg.includes("admin")) {
              toast.error("Admin accounts must sign in with email and password");
            } else if (msg.includes("deactivated")) {
              toast.error("Your account has been deactivated. Please contact support.");
            } else {
              toast.error(result.message || "Account access denied");
            }
          } else if (status === 429) {
            toast.error(
              result.message || "Too many sign-in attempts. Please try again later."
            );
          } else if (status === 503) {
            toast.error(
              result.message || "Google sign-in is not configured on the server."
            );
          } else if (status === 401) {
            toast.error(result.message || "Invalid or expired Google token");
          } else {
            toast.error(result.message || "Google sign-in failed");
          }
        }
      } catch {
        toast.error("Network error during Google sign-in. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [getValidRedirectPath, queryClient, router]
  );

  // Initialize and render the button into the container
  const renderGoogleButton = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const google = (window as unknown as { google?: GoogleGlobal }).google;
    if (!google?.accounts?.id || !containerRef.current || !clientId) return;

    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      // Clear container before re-rendering
      containerRef.current.innerHTML = "";

      const gTheme = resolvedTheme === "dark" ? "filled_black" : "outline";

      // Render official Google button
      google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: gTheme,
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 360,
      });
    } catch (e) {
      // If renderButton fails, log warning silently; script onError handles network/load failures
      console.warn("Google button render encountered an issue:", e);
    }
  }, [clientId, handleCredentialResponse, resolvedTheme]);

  React.useEffect(() => {
    if (scriptLoaded) {
      renderGoogleButton();
    }
  }, [scriptLoaded, renderGoogleButton]);

  // If NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set, hide the button completely
  if (!clientId || clientId.trim() === "") {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onReady={() => {
          setScriptLoaded(true);
        }}
        onError={() => {
          setScriptError(true);
        }}
      />

      {scriptError ? (
        <div className="w-full text-center py-2 px-3 rounded-lg border border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Google Sign-In unavailable (blocked or failed to load).
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`w-full min-h-[44px] flex justify-center items-center overflow-hidden transition-opacity ${
            isSubmitting ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
          aria-label="Continue with Google"
        />
      )}
    </div>
  );
}
