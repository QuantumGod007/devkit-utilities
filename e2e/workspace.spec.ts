import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const cases = [
  {
    tool: "JSON formatter",
    action: "Format JSON",
    input: '{"a":1}',
    expected: '{\n  "a": 1\n}',
  },
  {
    tool: "Base64 codec",
    action: "Encode",
    input: "Hello 世界 👋",
    expected: "SGVsbG8g5LiW55WMIPCfkYs=",
  },
  {
    tool: "Unix timestamp",
    action: "Seconds → UTC",
    input: "0",
    expected: "1970-01-01T00:00:00.000Z",
  },
  {
    tool: "URL codec",
    action: "Encode component",
    input: "hello world",
    expected: "hello%20world",
  },
  {
    tool: "Text case",
    action: "camelCase",
    input: "XMLHttpRequest",
    expected: "xmlHttpRequest",
  },
];
for (const item of cases) {
  test(`${item.tool} transforms its input`, async ({ page }) => {
    await page.getByRole("button", { name: item.tool, exact: true }).click();
    const panel = page.getByRole("region", { name: item.tool, exact: true });
    await panel.locator("textarea").first().fill(item.input);
    await panel.getByRole("button", { name: item.action, exact: true }).click();
    await expect(panel.getByLabel("Output", { exact: true })).toHaveValue(
      item.expected,
    );
  });
}

test("generators use bounded numeric controls and text inspector counts graphemes", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Password generator", exact: true })
    .click();
  await page.getByLabel("Password length", { exact: true }).fill("32");
  await page
    .getByRole("button", { name: "Generate password", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Password generator", exact: true })
      .getByLabel("Output"),
  ).toHaveValue(/^.{32}$/);
  await page
    .getByRole("button", { name: "UUID generator", exact: true })
    .click();
  await page.getByLabel("Number of UUIDs").fill("3");
  await page
    .getByRole("button", { name: "Generate UUIDs", exact: true })
    .click();
  const uuids = await page
    .getByRole("region", { name: "UUID generator", exact: true })
    .getByLabel("Output")
    .inputValue();
  expect(new Set(uuids.split("\n")).size).toBe(3);
  await page
    .getByRole("button", { name: "Text inspector", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Text inspector",
    exact: true,
  });
  await panel.getByLabel("Input", { exact: true }).fill("e\u0301👨‍👩‍👧‍👦");
  await panel.getByRole("button", { name: "Count text", exact: true }).click();
  expect(
    JSON.parse(await panel.getByLabel("Output").inputValue()).characters,
  ).toBe(2);
});

test("switching tools retains drafts and results while editing invalidates stale output", async ({
  page,
}) => {
  const input = page.getByRole("region").getByLabel("Input", { exact: true });
  await input.fill('{"draft":true}');
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  const expected = '{\n  "draft": true\n}';
  await page.getByRole("button", { name: "Base64 codec", exact: true }).click();
  await page
    .getByRole("button", { name: "JSON formatter", exact: true })
    .click();
  await expect(
    page.getByRole("region").getByLabel("Input", { exact: true }),
  ).toHaveValue('{"draft":true}');
  await expect(
    page.getByRole("region").getByLabel("Output", { exact: true }),
  ).toHaveValue(expected);
  await page
    .getByRole("region")
    .getByLabel("Input", { exact: true })
    .fill('{"different":true}');
  await expect(
    page.getByRole("region").getByLabel("Output", { exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Copy output", exact: true }),
  ).toBeDisabled();
});

test("calendar errors are accessible and clear immediately after an edit", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Unix timestamp", exact: true })
    .click();
  await page
    .getByLabel("Unix timestamp or ISO date")
    .fill("2024-02-30T00:00:00Z");
  await page
    .getByRole("button", { name: "ISO date → Unix", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("valid calendar date");
  await expect(page.getByLabel("Unix timestamp or ISO date")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page
    .getByLabel("Unix timestamp or ISO date")
    .fill("2024-02-29T00:00:00Z");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByLabel("Unix timestamp or ISO date")).toHaveAttribute(
    "aria-invalid",
    "false",
  );
});

test("clipboard success and permission failures give usable feedback", async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(
    await page
      .getByRole("region", { name: "JSON formatter", exact: true })
      .getByLabel("Output", { exact: true })
      .inputValue(),
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("permission denied");
});

test("an old clipboard request cannot describe a newly edited result", async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve) => {
            (window as unknown as { finishCopy: () => void }).finishCopy =
              resolve;
          }),
      },
    });
  });
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copying…" })).toBeDisabled();
  await page
    .getByRole("region")
    .getByLabel("Input", { exact: true })
    .fill("new draft");
  await page.evaluate(() =>
    (window as unknown as { finishCopy: () => void }).finishCopy(),
  );
  await expect(page.getByRole("status")).toHaveText("");
  await expect(
    page.getByRole("button", { name: "Copy output", exact: true }),
  ).toBeDisabled();
});

test("keyboard submission works without replacing line breaks", async ({
  page,
}) => {
  await page
    .getByRole("region")
    .getByLabel("Input", { exact: true })
    .fill('{"keyboard":true}');
  await page
    .getByRole("region")
    .getByLabel("Input", { exact: true })
    .press("Control+Enter");
  await expect(
    page.getByRole("region").getByLabel("Output", { exact: true }),
  ).toHaveValue('{\n  "keyboard": true\n}');
  await page
    .getByRole("button", { name: "Password generator", exact: true })
    .click();
  await page.getByLabel("Password length", { exact: true }).fill("12");
  await page.getByLabel("Password length", { exact: true }).press("Enter");
  await expect(
    page
      .getByRole("region", { name: "Password generator", exact: true })
      .getByLabel("Output"),
  ).toHaveValue(/^.{12}$/);
});

for (const width of [320, 390, 768, 1440]) {
  test(`all tools fit without page overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const tool of [
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
    ]) {
      await page.getByRole("button", { name: tool, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: tool, exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
