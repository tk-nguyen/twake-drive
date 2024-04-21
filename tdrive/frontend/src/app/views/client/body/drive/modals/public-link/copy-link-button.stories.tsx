import { Meta } from '@storybook/react';

import { CopyLinkButton } from './copy-link-button';

const meta: Meta<typeof CopyLinkButton> = {
  component: CopyLinkButton,
};
export default meta;

export const Default = {
  args: {
    textToCopy: "I should be in your clipboard",
  },
};