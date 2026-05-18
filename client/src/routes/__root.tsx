import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "../styles.css";
import { Navbar } from "#/components/ui/Navbar";
import { Container } from "@radix-ui/themes";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function ErrorComponent() {
  return <div>Error</div>;
}

function RootComponent() {
  return (
    <Container>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </Container>
  );
}
