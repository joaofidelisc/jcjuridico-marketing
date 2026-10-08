import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FONT} from './theme';

export const fontsLoaded = loadFont({
  family: FONT,
  url: staticFile('Montserrat.ttf'),
  weight: '100 900',
});
