export type Article = {
  id: string;
  title: string;
  content: string;
  extras: any;
  description: string;
  rawcontent: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
};

export type keyword = {
  id: string;
  keyword: string;
  volume: number;
};

export type Site = {
  id: string;
  name: string;
  keywords: [keyword];
  draft_description: JSON;
  settings: any;
  handle: string;
};

export declare interface EditorProps {
  handleKeyCommand: any;
  keyBindingFn: any;
}
