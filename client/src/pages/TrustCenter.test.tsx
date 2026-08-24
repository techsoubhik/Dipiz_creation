/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";
import TrustCenter from "./TrustCenter";

const { requestTracking } = vi.hoisted(() => ({ requestTracking: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    support: {
      requestTracking: {
        useMutation: ({ onSuccess }: { onSuccess: () => void }) => ({
          isPending: false,
          mutate: (input: unknown) => { requestTracking(input); onSuccess(); },
        }),
      },
    },
  },
}));

afterEach(cleanup);

describe("Trust Center", () => {
  it("opens customer-care answers and validates the order tracking request", async () => {
    const user = userEvent.setup();
    render(<TrustCenter />);

    await user.click(screen.getByRole("button", { name: /How long does a handmade order take/i }));
    expect(screen.getByText(/Ready-to-ship pieces are prepared/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Request order tracking" }));
    expect(screen.getByText(/Please enter your order number/i)).toBeTruthy();
    await user.type(screen.getByLabelText("Order number"), "DC-1024");
    await user.click(screen.getByRole("button", { name: "Request order tracking" }));
    expect(requestTracking).toHaveBeenCalledWith({ orderNumber: "DC-1024" });
    expect(screen.getByText(/request is with the studio team/i)).toBeTruthy();
  });
});
