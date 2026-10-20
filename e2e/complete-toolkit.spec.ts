import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const names = [
  "JSON formatter",
  "Base64 codec",
  "Password generator",
  "UUID generator",
  "Unix timestamp",
  "URL codec",
  "Text case",
  "Text inspector",
  "Color converter",
  "Markdown preview",
];
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeVisible();
});

test("JSON keeps large numbers and duplicate keys and gives useful errors", async ({
  page,
}) => {
  const panel = page.getByRole("region", {
    name: "JSON formatter",
    exact: true,
  });
  await panel
    .getByLabel("Input", { exact: true })
    .fill('{ "id": 9007199254740993, "id": 1e400 }');
  await panel.getByRole("button", { name: "Minify", exact: true }).click();
  await expect(panel.getByLabel("Output", { exact: true })).toHaveValue(
    '{"id":9007199254740993,"id":1e400}',
  );
  await panel.getByLabel("Input", { exact: true }).fill('{"a": }');
  await panel.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("Invalid JSON");
  await panel.getByLabel("Input", { exact: true }).fill('{"valid": true}');
  await expect(panel.getByRole("alert")).toHaveCount(0);
  await panel.getByRole("button", { name: "Validate", exact: true }).click();
  await expect(panel.getByLabel("Output", { exact: true })).toContainText(
    "Valid JSON",
  );
});

test("search includes keywords, has an empty state, and supports keyboard selection", async ({
  page,
}) => {
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeFocused();
  await page.getByRole("searchbox", { name: "Search tools" }).fill("  HEX  ");
  const nav = page.getByRole("navigation", { name: "Developer utilities" });
  await expect(nav.getByRole("button")).toHaveCount(1);
  await page
    .getByRole("searchbox", { name: "Search tools" })
    .press("ArrowDown");
  await expect(
    nav.getByRole("button", { name: "Color converter" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Color converter", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Search tools" })
    .fill("impossible-tool");
  await expect(page.getByText("No tools by that name.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeFocused();
  await expect(nav.getByRole("button")).toHaveCount(10);
  await nav.getByRole("button").first().focus();
  await page.keyboard.press("End");
  await expect(
    nav.getByRole("button", { name: "Markdown preview" }),
  ).toBeFocused();
});

test("tool URLs restore on reload and browser history while the skip link preserves selection", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Color converter", exact: true })
    .click();
  await expect(page).toHaveURL(/#color$/);
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  await expect(page).toHaveURL(/#markdown$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Color converter", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveTitle("Color converter — Devkit");
  await page.getByRole("link", { name: "Skip to workspace" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Color converter", exact: true }),
  ).toBeVisible();
});

test("colors convert alpha and modern CSS syntax and retain their editor draft", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Color converter", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Color converter",
    exact: true,
  });
  await panel
    .getByLabel("Color value", { exact: true })
    .fill("hsl(0 100% 50% / 50%)");
  await panel.getByRole("button", { name: "To HEX", exact: true }).click();
  await expect(panel.getByLabel("Output", { exact: true })).toHaveValue(
    "#ff000080",
  );
  await panel.getByRole("button", { name: "To RGB", exact: true }).click();
  await expect(panel.getByLabel("Output", { exact: true })).toHaveValue(
    "rgba(255, 0, 0, 0.5)",
  );
  await panel.getByLabel("Color value", { exact: true }).fill("rgb(999, 0, 0)");
  await panel.getByRole("button", { name: "To HEX", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("between 0 and 255");
  await panel
    .getByRole("button", { name: "Use color #a5b4fc", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toHaveCount(0);
  await expect(panel.getByLabel("Color value", { exact: true })).toHaveValue(
    "#a5b4fc",
  );
  await page
    .getByRole("button", { name: "JSON formatter", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Color converter", exact: true })
    .click();
  await expect(panel.getByLabel("Color value", { exact: true })).toHaveValue(
    "#a5b4fc",
  );
});

test("text statistics update while typing and include reading time", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Text inspector", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Text inspector",
    exact: true,
  });
  await panel
    .getByLabel("Input", { exact: true })
    .fill(Array(200).fill("word").join(" "));
  const stats = panel.getByRole("definition");
  await expect(stats.nth(0)).toHaveText("200");
  await expect(stats.nth(3)).toHaveText("1 min");
  await panel.getByRole("button", { name: "Count text", exact: true }).click();
  const output = JSON.parse(
    await panel.getByLabel("Output", { exact: true }).inputValue(),
  );
  expect(output.readingTimeSeconds).toBe(60);
  await panel.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(stats.nth(0)).toHaveText("0");
  await expect(stats.nth(3)).toHaveText("0 sec");
});

test("Markdown renders headings, code, tables and task lists live without executing HTML", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Markdown preview",
    exact: true,
  });
  const source =
    "# Working preview\n\n**Strong idea**\n\n- [x] Ship safely\n\n```ts\nconst ready = true;\n```\n\n| Tool | Ready |\n| --- | --- |\n| Devkit | Yes |\n\n[Docs](https://example.com)";
  await panel.getByLabel("Markdown source", { exact: true }).fill(source);
  const preview = panel.getByRole("region", { name: "Live preview" });
  await expect(
    preview.getByRole("heading", { name: "Working preview" }),
  ).toBeVisible();
  await expect(preview.locator("strong")).toHaveText("Strong idea");
  await expect(preview.locator("pre code")).toHaveText("const ready = true;\n");
  await expect(preview.getByRole("table")).toBeVisible();
  await expect(
    preview.getByRole("checkbox", { name: "Completed task" }),
  ).toBeChecked();
  await expect(preview.getByRole("link", { name: "Docs" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await page
    .getByRole("button", { name: "JSON formatter", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  await expect(
    panel.getByLabel("Markdown source", { exact: true }),
  ).toHaveValue(source);
  await panel.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(preview.getByText("A blank page. A good start.")).toBeVisible();
});

test("Markdown blocks HTML, dangerous URLs, and remote image requests", async ({
  page,
}) => {
  const outbound: string[] = [];
  const dialogs: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("tracker.invalid")) outbound.push(request.url());
  });
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Markdown preview",
    exact: true,
  });
  await panel
    .getByLabel("Markdown source", { exact: true })
    .fill(
      '# Safe\n\n<script>alert("xss")</script>\n\n<img src="https://tracker.invalid/raw" onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n[encoded](data:text/html;base64,PHNjcmlwdD4=)\n\n![tracker](https://tracker.invalid/pixel)',
    );
  const preview = panel.getByRole("region", { name: "Live preview" });
  await expect(preview.getByRole("heading", { name: "Safe" })).toBeVisible();
  await expect(
    preview.getByText("External images are not loaded."),
  ).toBeVisible();
  await expect(preview.locator("script,iframe,object,img")).toHaveCount(0);
  await expect(preview.getByRole("link")).toHaveCount(0);
  expect(outbound).toEqual([]);
  expect(dialogs).toEqual([]);
});

test("Markdown source can be copied without leaking preview HTML", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    }),
  );
  const panel = page.getByRole("region", {
    name: "Markdown preview",
    exact: true,
  });
  await panel
    .getByLabel("Markdown source", { exact: true })
    .fill("## Keep **building**");
  await panel
    .getByRole("button", { name: "Copy Markdown", exact: true })
    .click();
  await expect(panel.getByRole("status")).toHaveText("Copied to clipboard.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe("## Keep **building**");
});

test("action notifications can be dismissed and remain bounded", async ({
  page,
}) => {
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Format JSON", exact: true })
      .click();
  const notices = page.getByRole("region", { name: "Notifications" });
  await expect(
    notices.getByRole("button", { name: "Dismiss notification" }),
  ).toHaveCount(3);
  await notices
    .getByRole("button", { name: "Dismiss notification" })
    .first()
    .click();
  await expect(
    notices.getByRole("button", { name: "Dismiss notification" }),
  ).toHaveCount(2);
});

for (const name of names) {
  test(`${name} meets automated WCAG AA checks`, async ({ page }) => {
    await page.getByRole("button", { name, exact: true }).click();
    if (name === "Markdown preview")
      await expect(
        page.getByRole("heading", { name: "A little less friction." }),
      ).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test("the application stays local, reports no runtime errors, and provides shareable screenshots", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4190"))
      external.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const response = await page.reload();
  expect(response?.headers()["content-security-policy"]).toContain(
    "connect-src 'none'",
  );
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  await page
    .getByRole("region", { name: "Notifications" })
    .getByRole("button", { name: "Dismiss notification" })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Color converter", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("color.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A little less friction." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("Markdown footnotes retain working targets without overwriting the selected tool URL", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Markdown preview",
    exact: true,
  });
  await panel
    .getByLabel("Markdown source", { exact: true })
    .fill("A note[^1].\n\n[^1]: A safe reference.");
  const preview = panel.getByRole("region", { name: "Live preview" });
  await preview.getByRole("link", { name: "1", exact: true }).click();
  await expect(page).toHaveURL(/#markdown$/);
  await expect(preview.locator("#user-content-fn-1")).toBeFocused();
  const back = preview.locator('a[href="#user-content-fnref-1"]');
  await back.click();
  await expect(preview.locator("#user-content-fnref-1")).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("mobile invalid input and an empty tool search remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Color converter", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Color converter",
    exact: true,
  });
  await panel.getByLabel("Color value", { exact: true }).fill("not a color");
  await panel.getByRole("button", { name: "To HEX", exact: true }).click();
  await expect(panel.getByRole("alert")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page
    .getByRole("searchbox", { name: "Search tools" })
    .fill("no-such-tool");
  await expect(page.getByText("No tools by that name.")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
