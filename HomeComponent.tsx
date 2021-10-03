import React from 'react';
import {Alert, Button, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements';
import {StarPrinter, StarXpandCommand} from 'react-native-star-io10';
import {SelectedPrinterContext} from './SelectedPrinterContext';
import {imageEncodedBase64} from './image';

interface Props {}

interface State {
  printing: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  printer: {},
  printerTitle: {
    fontWeight: 'bold',
  },
  printerContent: {
    marginTop: 2,
    marginStart: 8,
  },
  discoveryContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  printContainer: {
    marginTop: 32,
  },
});

export default function (props: Props) {
  const navigation = useNavigation();
  // @ts-ignore
  return <HomeComponent {...props} navigation={navigation} />;
}

class HomeComponent extends React.Component<Props, State> {
  static contextType = SelectedPrinterContext;

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.printer}>
          <Text style={styles.printerTitle}>Printer</Text>
          <SelectedPrinterContext.Consumer>
            {value => (
              <>
                <Text style={styles.printerContent} numberOfLines={1}>
                  Model: {value?.printer?.information?.model.toString() || '-'}
                </Text>
                <Text style={styles.printerContent} numberOfLines={1}>
                  InterfaceType:
                  {value?.printer?.connectionSettings?.interfaceType.toString() ||
                    '-'}
                </Text>
                <Text style={styles.printerContent} numberOfLines={1}>
                  Identifier:
                  {value?.printer?.connectionSettings?.identifier || '-'}
                </Text>
              </>
            )}
          </SelectedPrinterContext.Consumer>
        </View>
        <View style={styles.discoveryContainer}>
          <Button
            title="Discovery"
            // @ts-ignore
            onPress={() => this.props.navigation.navigate('PrinterDiscover')}
          />
        </View>
        <Divider />
        <View style={styles.printContainer}>
          <SelectedPrinterContext.Consumer>
            {value => (
              <Button
                title="Print"
                disabled={!value.printer || this.state?.printing}
                onPress={() => {
                  const printer = value.printer;
                  if (printer) {
                    this.print(printer)
                      .then(() => Alert.alert('Successed to print.'))
                      .catch(() => Alert.alert('Failed to print.'));
                  }
                }}
              />
            )}
          </SelectedPrinterContext.Consumer>
        </View>
      </View>
    );
  }

  private async print(printer: StarPrinter) {
    printer.openTimeout = 10000;
    printer.printTimeout = 60000;
    printer.getStatusTimeout = 10000;

    this.setState({printing: true});

    try {
      const printerBuilder = new StarXpandCommand.PrinterBuilder()
        .actionPrintImage(
          new StarXpandCommand.Printer.ImageParameter(imageEncodedBase64, 576),
        )
        .actionPrintText('雪村 (Sesson Shukei)')
        .actionCut(StarXpandCommand.Printer.CutType.Full);
      const documentBuilder = new StarXpandCommand.DocumentBuilder().addPrinter(
        printerBuilder,
      );
      const commandBuilder =
        new StarXpandCommand.StarXpandCommandBuilder().addDocument(
          documentBuilder,
        );
      const commands = await commandBuilder.getCommands();

      await printer.open();
      await printer.print(commands);
      await printer.close();
      return Promise.resolve();
    } finally {
      this.setState({printing: false});
    }
  }
}
