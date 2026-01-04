import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

function loadScript(dom, relativePath) {
  const scriptPath = path.resolve(process.cwd(), "..", relativePath);
  const scriptContent = fs.readFileSync(scriptPath, "utf8");
  dom.window.eval(scriptContent);
}

describe("UI dialog and chat rendering", () => {
  test("dialog modal renders payload content", () => {
    const dom = new JSDOM(
      `
      <div id="dialogModal" class="modal">
        <h5 id="dialogModalTitle"></h5>
        <p id="dialogModalBody"></p>
      </div>
      `,
      { runScripts: "dangerously" }
    );

    loadScript(dom, "src/main/resources/static/js/dialog.js");

    dom.window.DialogUI.showDialog({ title: "NPC Greeting", message: "Welcome!" });

    const title = dom.window.document.getElementById("dialogModalTitle");
    const body = dom.window.document.getElementById("dialogModalBody");

    expect(title.textContent).toBe("NPC Greeting");
    expect(body.textContent).toBe("Welcome!");
  });

  test("chat renderer appends messages", () => {
    const dom = new JSDOM(
      `
      <p id="chat-status"></p>
      <div id="chatMessages"></div>
      <input id="chatInput" />
      <button id="chatSendButton"></button>
      `,
      { runScripts: "dangerously" }
    );

    dom.window.__CHAT_UI_DISABLE_AUTO_INIT__ = true;
    loadScript(dom, "src/main/resources/static/js/chat.js");

    dom.window.ChatUI.renderMessages([
      { senderId: "playerA", content: "Hello!" },
      { senderId: "playerB", content: "Hi!" }
    ]);

    const messages = dom.window.document.querySelectorAll(".chat-message");
    expect(messages).toHaveLength(2);
    expect(messages[0].textContent).toContain("playerA");
    expect(messages[0].textContent).toContain("Hello!");
  });
});
