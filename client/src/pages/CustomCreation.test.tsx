/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CustomCreation from "./CustomCreation";

const { submitMutation } = vi.hoisted(() => ({ submitMutation: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    customOrders: {
      submit: {
        useMutation: ({ onSuccess }: { onSuccess: () => void }) => ({
          isPending: false,
          mutate: (input: unknown) => {
            submitMutation(input);
            onSuccess();
          },
        }),
      },
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Custom Creation form", () => {
  it("requires the current step and progresses when valid details are supplied", async () => {
    const user = userEvent.setup();
    render(<CustomCreation />);

    await user.click(screen.getByRole("button", { name: /Continue/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/name/i);

    await user.type(screen.getByLabelText("Your name"), "Anika");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    expect(screen.getByText("Step 2 of 9")).toBeTruthy();
    expect(screen.getByLabelText("WhatsApp number")).toBeTruthy();
  });

  it("collects all required details, accepts a reference image, and confirms the submitted custom order", async () => {
    const user = userEvent.setup();
    render(<CustomCreation />);

    await user.type(screen.getByLabelText("Your name"), "Anika");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("WhatsApp number"), "+15551234567");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("What are we creating for?"), "A birthday keepsake");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByRole("button", { name: "Custom Resin Art" }));
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("Colour and style direction"), "Blush, pearl and soft gold");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByRole("button", { name: "$125 – $200" }));
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("When do you need it?"), "2026-12-24");
    await user.click(screen.getByRole("button", { name: /Continue/i }));

    const reference = new File(["reference"], "palette.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/Upload a reference image/i), reference);
    expect(screen.getByText("palette.png")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByRole("button", { name: "Start My Custom Order" }));
    expect(screen.getByRole("alert").textContent).toMatch(/short message/i);
    await user.type(screen.getByLabelText("A final note for the studio"), "For a very sentimental friend.");
    await user.click(screen.getByRole("button", { name: "Start My Custom Order" }));

    await waitFor(() => expect(submitMutation).toHaveBeenCalledTimes(1));
    expect(submitMutation.mock.calls[0]?.[0]).toMatchObject({
      name: "Anika",
      productType: "Custom Resin Art",
      referenceImage: { name: "palette.png", mimeType: "image/png" },
    });
    expect(await screen.findByText("Thank you, Anika.")).toBeTruthy();
  });

  it("blocks progression when a custom product type has not been chosen", async () => {
    const user = userEvent.setup();
    render(<CustomCreation />);

    await user.type(screen.getByLabelText("Your name"), "Anika");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("WhatsApp number"), "+15551234567");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.type(screen.getByLabelText("What are we creating for?"), "A keepsake");
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByRole("button", { name: /Continue/i }));

    expect(screen.getByRole("alert").textContent).toMatch(/creation type/i);
  });
});
