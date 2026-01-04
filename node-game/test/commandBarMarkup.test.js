import fs from "fs";
import { JSDOM } from "jsdom";

describe("command bar markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  test("renders a command bar with brand identity", () => {
    const commandBar = document.querySelector(".command-bar");
    expect(commandBar).not.toBeNull();

    const brand = commandBar.querySelector(".command-bar__brand");
    expect(brand).not.toBeNull();
    expect(brand.querySelector(".command-title")?.textContent).toMatch(/Command Deck/i);
    expect(brand.querySelector(".command-eyebrow")?.textContent).toMatch(/DaisyQuest/i);
  });

  test("lists realm status pills", () => {
    const statusGroup = document.querySelector(".command-bar__status");
    expect(statusGroup).not.toBeNull();

    const pills = statusGroup.querySelectorAll(".status-pill");
    expect(pills.length).toBeGreaterThanOrEqual(3);

    pills.forEach((pill) => {
      expect(pill.querySelector(".status-pill__label")).not.toBeNull();
      expect(pill.querySelector(".status-pill__value")).not.toBeNull();
    });
  });
});
