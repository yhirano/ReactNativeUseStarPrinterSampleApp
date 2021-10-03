import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {
  StarPrinter,
  StarDeviceDiscoveryManagerFactory,
  InterfaceType,
  StarDeviceDiscoveryManager,
} from 'react-native-star-io10';
import {SelectedPrinterContext} from './SelectedPrinterContext';

interface Props {}

interface State {
  discoveredPrinters: ReadonlyArray<StarPrinter>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  item: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingStart: 16,
    paddingEnd: 16,
  },
  itemModel: {},
  itemInterfaceType: {
    marginTop: 4,
  },
  itemIdentifier: {
    marginTop: 4,
  },
});

export default function (props: Props) {
  const navigation = useNavigation();
  // @ts-ignore
  return <PrinterDiscoverComponent {...props} navigation={navigation} />;
}

class PrinterDiscoverComponent extends React.Component<Props, State> {
  static contextType = SelectedPrinterContext;

  private starDeviceDiscoveryManager: StarDeviceDiscoveryManager | undefined =
    undefined;

  async componentDidMount() {
    const isEmulator = await DeviceInfo.isEmulator();
    const starDeviceDiscoveryManager =
      await StarDeviceDiscoveryManagerFactory.create([
        InterfaceType.Lan,
        InterfaceType.Usb,
        ...(!isEmulator ? [InterfaceType.Bluetooth] : []),
        ...(!isEmulator && Platform.OS === 'ios'
          ? [InterfaceType.BluetoothLE]
          : []),
      ]);
    this.starDeviceDiscoveryManager = starDeviceDiscoveryManager;
    starDeviceDiscoveryManager.onPrinterFound = (printer: StarPrinter) => {
      this.setState({
        discoveredPrinters: PrinterDiscoverComponent.generate(
          this.state?.discoveredPrinters,
          printer,
        ),
      });
    };
    await starDeviceDiscoveryManager.startDiscovery();
  }

  componentWillUnmount() {
    this.starDeviceDiscoveryManager?.stopDiscovery();
    this.starDeviceDiscoveryManager = undefined;
  }

  render() {
    const data = this.state?.discoveredPrinters ?? [];
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={data}
          renderItem={item => {
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  this.context.setSelectedPrinter({
                    printer: item.item,
                  });
                  // @ts-ignore
                  this.props.navigation.pop();
                }}>
                <Text style={styles.itemModel} numberOfLines={1}>
                  Model: {item.item.information?.model.toString()}
                </Text>
                <Text style={styles.itemInterfaceType} numberOfLines={1}>
                  InterfaceType:{' '}
                  {item.item?.connectionSettings?.interfaceType.toString()}
                </Text>
                <Text style={styles.itemIdentifier} numberOfLines={1}>
                  Identifier: {item.item.connectionSettings?.identifier}
                </Text>
              </TouchableOpacity>
            );
          }}
          persistentScrollbar={true}
          ItemSeparatorComponent={() => <Divider />}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  }

  private static generate(
    printers: ReadonlyArray<StarPrinter> | undefined,
    newPrinter: StarPrinter,
  ): ReadonlyArray<StarPrinter> {
    if (!newPrinter.connectionSettings?.identifier) {
      return printers || [];
    }

    const result: StarPrinter[] = [];
    var added = false;
    for (const printer of printers || []) {
      if (!printer.connectionSettings?.identifier) {
        continue;
      }
      if (
        printer.connectionSettings?.identifier ===
        newPrinter.connectionSettings?.identifier
      ) {
        result.push(newPrinter);
        added = true;
      } else {
        result.push(printer);
      }
    }
    if (!added) {
      result.push(newPrinter);
    }
    return result;
  }
}
