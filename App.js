// App.js

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ImagePickerComponent from './src/components/ImagePickerComponent';
import ContactsComponent from './src/components/ContactsComponent';
import AuditClosureComponent from './src/components/AuditClosureComponent';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ImagePickerComponent />
      <AuditClosureComponent />
      <ContactsComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default App;