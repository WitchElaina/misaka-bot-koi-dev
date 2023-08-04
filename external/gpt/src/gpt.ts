import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';

export interface GPTConfig {
  apiKey: string;
  httpProxy?: string;
  model?: string;
  initial?: string;
}

export class GPT {
  openai: OpenAIApi;
  curMessages: ChatCompletionRequestMessage[];
  apiKey: string;
  httpProxy?: string;
  model?: string;
  initial?: string;
  tokenUsed: number;
  constructor(config: GPTConfig) {
    const conf = new Configuration({
      apiKey: config.apiKey,
    });
    this.openai = new OpenAIApi(conf);
    this.curMessages = [];
    this.apiKey = config.apiKey;
    this.httpProxy = config.httpProxy || '';
    this.model = config.model || 'gpt-3.5-turbo';
    this.initial = config.initial || '';
    this.tokenUsed = 0;
  }

  newChat = async (content: string) => {
    if (this.initial !== '' && this.curMessages.length === 0) {
      this.curMessages.push({
        role: 'system',
        content: this.initial,
      });
    }
    this.curMessages.push({
      role: 'user',
      content,
    });
    if (this.httpProxy !== '') {
      return await this.openai
        .createChatCompletion(
          {
            model: this.model,
            messages: this.curMessages,
          },
          {
            proxy: false,
            httpAgent: this.httpProxy,
          },
        )
        .then((res) => {
          this.curMessages.push({
            role: 'assistant',
            content: res.data.choices[0].message?.content,
          });
          this.tokenUsed = res.data.usage?.total_tokens || 0;
          return res.data.choices[0].message?.content || 'No response';
        })
        .catch((err) => {
          this.clearChat();
          return 'Error' + err?.message;
        });
    } else {
      return await this.openai
        .createChatCompletion({
          model: this.model,
          messages: this.curMessages,
        })
        .then((res) => {
          this.curMessages.push({
            role: 'assistant',
            content: res.data.choices[0].message?.content,
          });
          this.tokenUsed = res.data.usage?.total_tokens || 0;
          return res.data.choices[0].message?.content || 'No response';
        })
        .catch((err) => {
          this.clearChat();
          return 'Error' + err?.message;
        });
    }
  };
  clearChat = () => {
    this.curMessages = [];
    this.tokenUsed = 0;
  };
  reset = () => {
    this.clearChat();
    this.initial = '';
  };
  getInfo = () => {
    return `Tokens used: ${this.tokenUsed}\nTotal messages: ${this.curMessages.length}`;
  };
}
