import { config as baseConfig } from "@repo/eslint-config/base";
import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [...baseConfig, ...reactInternalConfig, ...nextJsConfig];
