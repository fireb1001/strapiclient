import { History } from 'history';
import { ContentBlock, ContentState } from 'draft-js';

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
  city: string;
  published: boolean;
  description: string;
  extras: any;
  sites: [Site];
  mediaitems: [any];
  rawcontent: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Customtype = {
  id: string;
  title: string;
  content: string;
  type: 'service' | 'product' | 'locatio';
  extras: any;
  description: string;
  rawcontent: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
};

export type Keyword = {
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
  keywords: [Keyword];
  draft_description: JSON;
  settings: any;
  handle: string;
};

export type MarkdownData = {
  title: string;
  cover: string;
  author: 'مؤمن';
  createdAt: Date;
  type?: string;
  layout?: string;
  description: string;
  content: string;
};

export declare interface EditorProps {
  handleKeyCommand: any;
  keyBindingFn: any;
}

export declare interface CustomRenderProps {
  block: ContentBlock;
  contentState: ContentState;
  blockProps: any;
}
