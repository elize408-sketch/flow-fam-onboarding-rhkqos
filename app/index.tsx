
import React from 'react';
import { View, Text } from 'react-native';

export default function BootScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#000' }}>
        BOOT OK
      </Text>
    </View>
  );
}
