import React from 'react';
import {Composition, Folder} from 'remotion';
import './fonts';
import {JCPromo, SCENES, TOTAL} from './JCPromo';
import {FunilPromo, F_SCENES, F_TOTAL} from './funil/FunilPromo';
import {ViralRescisao, V_TOTAL} from './viral/Rescisao';

const V = {width: 1080, height: 1920, fps: 30};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="JCPromo" component={JCPromo} durationInFrames={TOTAL} {...V} defaultProps={{music: 'music/726_ext.mp3'}} />
    <Folder name="Cenas">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={s.C} durationInFrames={s.dur} {...V} />
      ))}
    </Folder>
    <Composition id="FunilPromo" component={FunilPromo} durationInFrames={F_TOTAL} {...V} defaultProps={{music: 'music/726_ext.mp3'}} />
    <Folder name="CenasFunil">
      {F_SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={s.C} durationInFrames={s.dur} {...V} />
      ))}
    </Folder>
    <Composition id="ViralRescisao" component={ViralRescisao} durationInFrames={V_TOTAL} {...V} defaultProps={{music: 'music/pixabay-upbeat-happy-corporate.mp3'}} />
  </>
);
