import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeComponent from './HomeComponent';
import PrinterDiscoverComponent from './PrinterDiscoverComponent';
import {
  SelectedPrinter,
  SelectedPrinterContext,
} from './SelectedPrinterContext';

const Stack = createStackNavigator();

export default function App() {
  const [selectedPrinter, setSelectedPrinter] = useState<SelectedPrinter>({
    printer: null,
    setSelectedPrinter: _ => {},
  });

  return (
    <SelectedPrinterContext.Provider
      value={{
        printer: selectedPrinter.printer,
        setSelectedPrinter: setSelectedPrinter,
      }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeComponent}
            options={{title: 'Star Printer example'}}
          />
          <Stack.Screen
            name="PrinterDiscover"
            component={PrinterDiscoverComponent}
            options={{title: 'Please select printer'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SelectedPrinterContext.Provider>
  );
}
