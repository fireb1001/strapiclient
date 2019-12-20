import {
  KeyBindingUtil,
  getDefaultKeyBinding,
  BlockMap,
  ContentBlock,
} from 'draft-js';
import MediaComponent from '../components/MediaComponent';
import SimpleQuote from '../components/editors/SimpleQuote';
const { hasCommandModifier } = KeyBindingUtil;

export const KEY_COMMANDS = {
  CTRL_ALT_N: 'CTRL_ALT_N',
  ALT_B: 'ALT_B',
  CTRL_N: 'CTRL_N',
  CTRL_D: 'CTRL_D',
  CTRL_L: 'CTRL_L',
  CTRL_PAGEUP: 'CTRL_PAGEUP',
  CTRL_PAGEDOWN: 'CTRL_PAGEDOWN',
};

export function customConvertMd(entity: any, text: string) {
  // Todo check when lose entity
  if (text) {
    console.log(entity, text);
    return `@ ${text} @`;
  }
  if (entity.type === 'Quote') {
    console.log('Quote', entity);
    return `@ ${entity.data.quote} @`;
  }

  if (entity.type === 'IMAGE') {
    return `{{< figure src="${entity.data.src}" alt="${entity.data.alt}" caption="${entity.data.caption}" position="center" >}}`;
  }
  if (entity.type === 'LINK') {
    return ` [${text}](${entity.data.url})`;
  }
}

export function myKeyBindingFn(e: any): string {
  let AltCrtlPressed =
    e.getModifierState('Alt') && e.getModifierState('Control');

  if (e.key === '1' && AltCrtlPressed) {
    return 'select-one';
  }
  if (e.keyCode === 97 && hasCommandModifier(e)) {
    return 'header-one';
  }
  if (e.keyCode === 98 && hasCommandModifier(e)) {
    return 'header-two';
  }
  if (e.keyCode === 99 && hasCommandModifier(e)) {
    return 'header-three';
  }

  if (e.keyCode === 83 /* S key */ && hasCommandModifier(e)) {
    return 'ctrl+s';
  }

  if (e.keyCode === 75 /* K key */ && hasCommandModifier(e)) {
    return 'ctrl+k';
  }

  if (e.keyCode === 78 /* N key */ && hasCommandModifier(e)) {
    return KEY_COMMANDS.CTRL_N;
  }

  if (e.keyCode === 68 /* D key */ && hasCommandModifier(e)) {
    return KEY_COMMANDS.CTRL_D;
  }

  if (e.keyCode === 33 /* page up key */ && hasCommandModifier(e)) {
    return KEY_COMMANDS.CTRL_PAGEUP;
  }

  if (e.keyCode === 34 /* N key */ && hasCommandModifier(e)) {
    return KEY_COMMANDS.CTRL_PAGEDOWN;
  }

  if (e.keyCode === 78 /* N key */ && AltCrtlPressed) {
    return KEY_COMMANDS.CTRL_ALT_N;
  }

  if (e.keyCode === 76 /* L key */ && hasCommandModifier(e)) {
    return KEY_COMMANDS.CTRL_L;
  }

  if (e.keyCode === 66 /* B key */ && e.getModifierState('Alt')) {
    return KEY_COMMANDS.ALT_B;
  }
  // @ts-ignore
  return getDefaultKeyBinding(e);
}

type MoveDirection = 'UP' | 'DOWN';

export function moveBlock(
  blockMap: BlockMap,
  blockKey: string,
  direction: MoveDirection
): ContentBlock[] {
  let blocksArr = blockMap.toArray();

  let index = blocksArr.findIndex(block => {
    return block && block.getKey() === blockKey;
  });
  if (direction === 'UP' && index > 0) {
    let tmp = blocksArr[index];
    blocksArr[index] = blocksArr[index - 1];
    blocksArr[index - 1] = tmp;
  } else if (direction === 'DOWN' && index < blocksArr.length - 1) {
    let tmp = blocksArr[index];
    blocksArr[index] = blocksArr[index + 1];
    blocksArr[index + 1] = tmp;
  }

  return blocksArr;
}

export function myBlockRenderer(contentBlock: ContentBlock) {
  if (contentBlock.getType() === 'atomic') {
    if (contentBlock.getEntityAt(0)) {
      console.log(contentBlock.getData().contains('quote'));
      if (contentBlock.getData().contains('quote'))
        return { component: SimpleQuote };

      return {
        component: MediaComponent,
      };
    }
    // else it will be quote for now
    else
      return {
        component: SimpleQuote,
      };
  }
  return null;
}
