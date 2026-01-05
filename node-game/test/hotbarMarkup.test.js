import fs from "fs";
import { JSDOM } from "jsdom";

describe("hotbar markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  test("renders a hotbar container in the combat panel", () => {
    const hotbar = document.getElementById("hotbar-slots");
    expect(hotbar).not.toBeNull();
    expect(hotbar?.getAttribute("role")).toBe("list");
  });

  test("renders spellbook and skillbook lists", () => {
    const spellbook = document.getElementById("spellbook-list");
    const skillbook = document.getElementById("skillbook-list");
    expect(spellbook).not.toBeNull();
    expect(skillbook).not.toBeNull();
    expect(spellbook?.dataset.spellbook).toBe("spells");
    expect(skillbook?.dataset.spellbook).toBe("skills");
  });
});
