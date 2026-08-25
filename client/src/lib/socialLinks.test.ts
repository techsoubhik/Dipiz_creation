import { describe, expect, it } from "vitest";
import { DIPIZ_INSTAGRAM_HANDLE, DIPIZ_INSTAGRAM_URL } from "./socialLinks";

describe("DIPIZ social links", () => {
  it("uses the owner-approved Instagram profile as the official follow destination", () => {
    expect(DIPIZ_INSTAGRAM_URL).toBe("https://www.instagram.com/dipiz_creation/");
    expect(DIPIZ_INSTAGRAM_HANDLE).toBe("@dipiz_creation");
  });
});
