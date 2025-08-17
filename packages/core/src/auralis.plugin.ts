import type { Auralis } from "./auralis.ts";

export interface AuralisPlugin<TPluginOptions extends object = never> {
  readonly name: string;
  register(app: Auralis, options?: TPluginOptions): void;
}

export function definePlugin<TPluginOptions extends object = never>(
  plugin: AuralisPlugin<TPluginOptions>
): AuralisPlugin<TPluginOptions> {
  return plugin;
}
