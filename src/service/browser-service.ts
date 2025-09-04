export interface BrowserService {
  getTemplate(url: string): Promise<string>;

  sendMessage(command: string, message: string): Promise<void>;
}
