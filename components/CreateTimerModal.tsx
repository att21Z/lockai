import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { X, Clock, Coffee, Save } from 'lucide-react-native';
import { colors, fonts } from '../constants/theme';

interface CreateTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (timer: {
    name: string;
    work_duration: number;
    break_duration: number;
    icon: string;
    color: string;
  }) => void;
}

const ICON_OPTIONS = [
  { name: 'Clock', label: '⏰' },
  { name: 'Flame', label: '🔥' },
  { name: 'Brain', label: '🧠' },
  { name: 'Zap', label: '⚡' },
  { name: 'Coffee', label: '☕' },
  { name: 'Book', label: '📚' },
  { name: 'Dumbbell', label: '🏋️' },
  { name: 'Laptop', label: '💻' },
];

const COLOR_OPTIONS = [
  { value: colors.blue, label: 'Bleu' },
  { value: colors.orange, label: 'Orange' },
  { value: colors.green, label: 'Vert' },
  { value: '#9333EA', label: 'Violet' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#F59E0B', label: 'Jaune' },
];

export default function CreateTimerModal({ visible, onClose, onSave }: CreateTimerModalProps) {
  const [name, setName] = useState('');
  const [workDuration, setWorkDuration] = useState('25');
  const [breakDuration, setBreakDuration] = useState('5');
  const [selectedIcon, setSelectedIcon] = useState('Clock');
  const [selectedColor, setSelectedColor] = useState(colors.blue);

  const handleSave = () => {
    if (!name.trim() || !workDuration || !breakDuration) {
      return;
    }

    onSave({
      name: name.trim(),
      work_duration: parseInt(workDuration),
      break_duration: parseInt(breakDuration),
      icon: selectedIcon,
      color: selectedColor,
    });

    setName('');
    setWorkDuration('25');
    setBreakDuration('5');
    setSelectedIcon('Clock');
    setSelectedColor(colors.blue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Créer une minuterie</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom de la tâche</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Faire mes devoirs"
                placeholderTextColor={colors.text + '40'}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>Durée (min)</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={20} color={colors.text} strokeWidth={2} />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="25"
                    placeholderTextColor={colors.text + '40'}
                    value={workDuration}
                    onChangeText={setWorkDuration}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>Pause (min)</Text>
                <View style={styles.inputWithIcon}>
                  <Coffee size={20} color={colors.text} strokeWidth={2} />
                  <TextInput
                    style={styles.inputSmall}
                    placeholder="5"
                    placeholderTextColor={colors.text + '40'}
                    value={breakDuration}
                    onChangeText={setBreakDuration}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Icône</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon.name && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon.name)}>
                    <Text style={styles.iconEmoji}>{icon.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Couleur</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      selectedColor === color.value && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color.value)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!name.trim() || !workDuration || !breakDuration) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!name.trim() || !workDuration || !breakDuration}>
            <Save size={20} color={colors.dark} strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.robotoMonoRegular,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.white,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: fonts.interRegular,
    color: colors.white,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 60,
    height: 60,
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blue + '20',
  },
  iconEmoji: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.white,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.blue,
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.dark,
    letterSpacing: 0.5,
  },
});
