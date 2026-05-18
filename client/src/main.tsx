import { Theme, ThemePanel } from "@radix-ui/themes";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./providers/app";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <Theme appearance="light" accentColor="violet" radius="medium">
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </Theme>,
);
