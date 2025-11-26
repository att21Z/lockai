import { TouchableOpacity, StyleSheet, Modal, View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Sparkles, X, Send } from 'lucide-react-native';
import { colors, fonts } from '../constants/theme';

export default function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre coach personnel IA. Comment puis-je vous aider à atteindre vos objectifs aujourd\'hui ?',
      isUser: false,
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
      };

      setMessages([...messages, newMessage]);

      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: 'Je comprends. Travaillons ensemble pour optimiser cette habitude et maximiser vos résultats !',
          isUser: false,
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);

      setMessage('');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}>
        <View style={styles.gradient}>
          <Sparkles size={24} color={colors.dark} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.coachIcon}>
                <Sparkles size={20} color={colors.dark} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.modalTitle}>COACH IA</Text>
                <Text style={styles.modalSubtitle}>Assistant personnel</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOpen(false)}>
              <X size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messagesContainer}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isUser ? styles.userBubble : styles.aiBubble,
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    msg.isUser ? styles.userText : styles.aiText,
                  ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Posez votre question..."
              placeholderTextColor={colors.text + '40'}
              value={message}
              onChangeText={setMessage}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!message.trim()}>
              <View style={[styles.sendButtonInner, !message.trim() && styles.sendButtonDisabled]}>
                <Send size={18} color={colors.dark} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coachIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.6,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.blue,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  messageText: {
    fontSize: 15,
    fontFamily: fonts.interRegular,
    lineHeight: 22,
  },
  userText: {
    color: colors.dark,
  },
  aiText: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 15,
    fontFamily: fonts.interRegular,
    color: colors.white,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sendButtonInner: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
});
