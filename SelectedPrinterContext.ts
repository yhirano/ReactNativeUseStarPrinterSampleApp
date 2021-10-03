import React from 'react';
import {StarPrinter} from 'react-native-star-io10';

export const SelectedPrinterContext = React.createContext<SelectedPrinter>({
  printer: null,
  setSelectedPrinter: _ => {},
});

export type SelectedPrinter = {
  printer: StarPrinter | null;
  setSelectedPrinter: (selectedPrinter: SelectedPrinter) => void;
};
