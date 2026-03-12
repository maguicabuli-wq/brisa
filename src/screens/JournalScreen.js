import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';
import { getJournalEntries, addJournalEntry } from '../utils/storage';

export default function JournalScreen() {
  const { t } = useApp();
  const [entries, setEntries] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newText, setNewText] = useState('');

  const loadEntries = useCallback(async () => {
    const data = await getJournalEntries();
    setEntries(data);
  }, []);

  useEffect(() => { loadEntries(); }, []);

  const handleSave = async () => {
    if (!newText.trim()) return;
    await addJournalEntry({ text: newText.trim() });
    setNewText('');
    setShowNew(false);
    loadEntries();
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.entryTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.entryText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('journalTitle')}</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setShowNew(true)}>
          <Text style={styles.newButtonText}>+ {t('journalNew')}</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>
            Tu diario está vacío. Empieza a escribir lo que sientes.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* New Entry Modal */}
      <Modal visible={showNew} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowNew(false); setNewText(''); }}>
                <Text style={styles.modalCancel}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('journalNew')}</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.modalSave}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDate}>{formatDate(new Date().toISOString())}</Text>
            <TextInput
              style={styles.modalInput}
              value={newText}
              onChangeText={setNewText}
              placeholder={t('journalPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  newButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  entry: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  entryTime: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  entryText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalDate: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
});
