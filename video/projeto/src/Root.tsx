import React from 'react';
import {Composition, Folder} from 'remotion';
import './fonts';
import {JCPromo, SCENES, TOTAL} from './JCPromo';
import {FunilPromo, F_SCENES, F_TOTAL} from './funil/FunilPromo';
import {ViralRescisao, V_TOTAL} from './viral/Rescisao';
import {AdvogAITeste, ADVOGAI_TESTE_DUR} from './advogai/Teste';
import {AdvogAIApresentacao, ADVOGAI_TOTAL} from './advogai/Apresentacao';
import {GravacaoEscondida, GRAVACAO_TOTAL} from './gravacao/Gravacao';
import {DesconexaoChefe, DESCONEXAO_TOTAL} from './desconexao/Desconexao';
import {SplitPayment, SPLIT_TOTAL} from './split/Split';

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
    <Composition id="AdvogAITeste" component={AdvogAITeste} durationInFrames={ADVOGAI_TESTE_DUR} {...V} />
    <Composition id="AdvogAIApresentacao" component={AdvogAIApresentacao} durationInFrames={ADVOGAI_TOTAL} {...V} defaultProps={{music: 'music/pixabay-calm-corporate.mp3'}} />
    <Composition id="GravacaoEscondida" component={GravacaoEscondida} durationInFrames={GRAVACAO_TOTAL} {...V} defaultProps={{music: 'music/pixabay-upbeat-happy-corporate.mp3'}} />
    <Composition id="DesconexaoChefe" component={DesconexaoChefe} durationInFrames={DESCONEXAO_TOTAL} {...V} />
    <Composition id="SplitPayment" component={SplitPayment} durationInFrames={SPLIT_TOTAL} {...V} />
  </>
);
