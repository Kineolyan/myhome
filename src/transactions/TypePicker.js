import React from 'react';
import reactStamp from 'react-stamp';

import ElementPicker from '../core/ElementPicker';
import {Type} from './models';

const PAYMENT_TYPES = [
  {id: Type.CARTE, name: 'Carte'},
  {id: Type.MONNAIE, name: 'Monnaie'},
  {id: Type.CHEQUE, name: 'Chèque'},
  {id: Type.VIREMENT, name: 'Virement'}
];

const TypePicker = reactStamp(React)
  .compose(ElementPicker)
  .compose({
    defaultProps: {
      hintText: 'Moyen de paiement',
      values: PAYMENT_TYPES
    },
    renderEmpty() {
      return <div>Aucun type</div>;
    }
  });

export default TypePicker;
