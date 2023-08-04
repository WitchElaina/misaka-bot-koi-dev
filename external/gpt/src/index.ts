import { GPT } from './gpt';

import { Context, Schema } from 'koishi';

export const name = 'gpt';

export interface Config {
  apiKey: string;
  model?: string;
  httpProxy?: string;
}

export const Config: Schema<Config> = Schema.object({
  apiKey: Schema.string().required(),
  model: Schema.string(),
  httpProxy: Schema.string(),
});

export function apply(ctx: Context) {
  ctx.plugin((_, config) => {
    const gpt = new GPT({
      apiKey: config.apiKey,
      httpProxy: config.httpProxy,
      model: config.model,
      initial: config.initial,
    });
    ctx.command('gpt <content:text>', 'GPT chatbot').action(async ({ session }, content) => {
      const res = await gpt.newChat(content);
      return res;
    });
  });
}
