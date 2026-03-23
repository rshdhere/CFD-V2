import { config as baseConfig } from "@CFD-V2/eslint-config/base";
import { config as reactInternalConfig } from "@CFD-V2/eslint-config/react-internal";
import { nextJsConfig } from "@CFD-V2/eslint-config/next-js";

export default [...baseConfig, ...reactInternalConfig, ...nextJsConfig];
