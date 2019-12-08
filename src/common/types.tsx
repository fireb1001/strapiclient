import { History } from "history";

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

export declare interface RouterProps {
  match: any;
  history: History;
}

export type Sprovider = {
  id: string;
  name: string;
  archived: boolean;
  description: string;
  extras: any;
  sites: [Site];
  mediaitems: [any];
  rawcontent: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type keyword = {
  id: string;
  keyword: string;
  volume: number;
};

export type DropItem = {
  label: string;
  action: string;
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
