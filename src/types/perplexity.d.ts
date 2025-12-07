declare module '@perplexity-ai/perplexity_ai' {
  export default class Perplexity {
    constructor(config: { apiKey: string });
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: { role: string; content: string }[];
          temperature?: number;
          max_tokens?: number;
          top_p?: number;
          stream?: boolean;
        }): Promise<{
          choices: {
            message: {
              content: string;
              role: string;
            };
          }[];
        }>;
      };
    };
  }
}
