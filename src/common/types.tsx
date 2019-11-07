export type Article = {
  id: string;
  title: string;
  content: string;
  rawcontent: string;
  createdAt: Date;
  updatedAt: Date;
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
};

export declare interface EditorProps {
  handleKeyCommand: any;
  keyBindingFn: any;
}
