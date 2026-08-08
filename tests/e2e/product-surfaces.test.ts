import { expect, test } from "@playwright/test";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "sidebar_state",
      url: "http://localhost:3000",
      value: "true",
    },
  ]);
});

test("shows incognito mode in the chat header", async ({ page }) => {
  await page.goto("/incognito");
  await expect(page.getByText("Incognito", { exact: true })).toBeVisible();
});

test("shows the selected project in the chat header", async ({ page }) => {
  const params = new URLSearchParams({
    project: PROJECT_ID,
    projectName: "Demo Project",
  });
  await page.goto(`/?${params.toString()}`);
  await expect(page.getByText("Demo Project", { exact: true })).toBeVisible();
});
