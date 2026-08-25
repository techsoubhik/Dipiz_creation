import { describe, expect, it } from "vitest";
import { DIPIZ_STUDIO_LOCATION, DIPIZ_STUDIO_LOCATION_LABEL } from "./storefrontContact";

describe("DIPIZ storefront contact details", () => {
  it("uses the owner-approved public studio location without a street-level address", () => {
    expect(DIPIZ_STUDIO_LOCATION).toBe("Kolkata, West Bengal 700102, India");
    expect(DIPIZ_STUDIO_LOCATION_LABEL).toBe("Studio location");
    expect(DIPIZ_STUDIO_LOCATION).not.toMatch(/road|street|lane/i);
  });
});
