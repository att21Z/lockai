import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { colors, fonts } from '../../constants/theme';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CoachScreen() {
  const { user } = useUser();
  const coachName = user?.coachName || 'Lock';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Salut ${user.firstName || 'champion'}. Je suis ${coachName}, ton coach IA. Je suis pas là pour te faire des compliments, je suis là pour te pousser à devenir la meilleure version de toi-même. Alors, c'est quoi ton objectif N°1 en ce moment ? Et surtout, qu'est-ce que tu FAIS concrètement pour l'atteindre ?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user, coachName]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/lock-chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.role !== 'assistant' || m.id !== '1')
            .map(m => ({
              role: m.role,
              content: m.content,
            }))
            .concat([{ role: 'user', content: inputText.trim() }]),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, j'ai rencontré un problème. Peux-tu réessayer ?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Sparkles size={28} color={colors.blue} strokeWidth={2.5} />
          <Text style={styles.title}>{coachName.toUpperCase()}</Text>
        </View>
        <Text style={styles.subtitle}>Ton partenaire accountability</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}>
            <Text
              style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}>
              {message.content}
            </Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator size="small" color={colors.text} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pose-moi une question..."
          placeholderTextColor={colors.text + '40'}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}>
          <Send size={20} color={colors.dark} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.blue,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: fonts.interRegular,
    lineHeight: 22,
  },
  userText: {
    color: colors.dark,
  },
  assistantText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: fonts.robotoMonoRegular,
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.background,
    marginBottom: 90,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.interRegular,
    color: colors.white,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
