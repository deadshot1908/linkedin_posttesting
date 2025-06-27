export interface Job {
  access_token: string;
  text: string;
  type?: 'IMAGE' | 'VIDEO';
  mediaPath?: string;
}
