import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from './components/Header';
import Main from './components/Main';

export default function App() {
  return (
    <View style={styles.container}>
     <Header/>
     <Main/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#134CB5',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
