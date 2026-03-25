import { readFile } from "node:fs/promises";

export const verificationEmailTemplatePromise = readFile(
  new URL("./email/email.html", import.meta.url),
  "utf8",
);
