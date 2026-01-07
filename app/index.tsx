
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

console.log('✅ app/index.tsx is loading');

export default function BootScreen() {
  console.log('✅ BootScreen component is rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>BOOT OK ✅</Text>
      <Text style={styles.subtitle}>React is rendering</Text>
      <Text style={styles.info}>Check console for logs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0f0',
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
  },
  info: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
});
