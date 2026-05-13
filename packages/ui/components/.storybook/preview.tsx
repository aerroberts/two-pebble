import type { Preview } from '@storybook/react';
import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { applyTheme, isTheme, type Theme, themes } from '../src/components/input/theme-toggle/theme';
import { TooltipProvider } from '../src/components/providers/tooltip-provider/tooltip-provider';
import '../src/styles/globals.css';

function readStorybookTheme(value: unknown) {
  return typeof value === 'string' && isTheme(value) ? value : 'tangerine';
}

function StorybookThemeFrame(props: { children: ReactNode; theme: Theme }) {
  useLayoutEffect(() => {
    applyTheme(props.theme);
  }, [props.theme]);

  return <div className="min-h-screen bg-background text-content">{props.children}</div>;
}

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: themes.map((theme) => ({ value: theme.name, title: theme.label })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'tangerine',
  },
  decorators: [
    (Story, context) => {
      const theme = readStorybookTheme(context.globals.theme);

      return (
        <StorybookThemeFrame theme={theme}>
          <TooltipProvider>
            <Story />
          </TooltipProvider>
        </StorybookThemeFrame>
      );
    },
  ],
};

export default preview;
