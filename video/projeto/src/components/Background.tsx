import React from 'react';
import {Paper} from '../funil/ui';

// Fundo claro (mesma identidade do vídeo do Funil Jurídico). "variant" mantido por compatibilidade.
export const Background: React.FC<{variant?: 'navy' | 'deep'; logo?: boolean; footer?: boolean}> = ({logo = true, footer = true}) => (
  <Paper logo={logo} footer={footer} label="JC Jurídico" />
);
