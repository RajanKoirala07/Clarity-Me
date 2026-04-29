import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { BASE_URL } from '@/services/api';
import { getItem } from '@/services/storage';
import { useAppTheme } from '@/context/ThemeContext';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Category = 'sensory' | 'motor' | 'breathing';

const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
  { id: 'sensory', label: 'Sensory', icon: 'eye-outline', description: 'Sensory processing exercises' },
  { id: 'motor', label: 'Motor', icon: 'body-outline', description: 'Motor skill activities' },
  { id: 'breathing', label: 'Breathing', icon: 'flower-outline', description: 'Breathing & relaxation' },
];

interface Props {
  visible?: boolean;
  onRequestClose?: () => void;
}

export default function FloatingUploadButton({ visible, onRequestClose }: Props = {}) {
  const { colors } = useAppTheme();
  const controlled = visible !== undefined;
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const isOpen = controlled ? visible! : modalVisible;
  const closeModal = () => {
    if (controlled) onRequestClose?.();
    else setModalVisible(false);
    resetForm();
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your media library to upload videos.',
      );
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setTitle('');
    setDescription('');
  };

  const pickVideo = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for the video.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Select a category', 'Please choose Sensory, Motor, or Breathing before uploading.');
      return;
    }
    closeModal();
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const video = result.assets[0];
    await uploadVideo(video);
  };

  const uploadVideo = async (video: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      const token = await getItem('accessToken');

      const fileName = video.fileName ?? `upload.${video.mimeType?.split('/')[1] ?? 'mp4'}`;
      const mimeType = video.mimeType ?? 'video/mp4';

      const formData = new FormData();
      if (Platform.OS === 'web') {
        // On web, { uri } trick sends a string — fetch the blob URL to get real binary
        const blobRes = await fetch(video.uri);
        const blob = await blobRes.blob();
        formData.append('video', blob, fileName);
      } else {
        formData.append('video', { uri: video.uri, name: fileName, type: mimeType } as any);
      }
      formData.append('category', selectedCategory ?? '');
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      console.log('[Upload] starting →', `${BASE_URL}/storage/upload-video`);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/storage/upload-video`);
        xhr.setRequestHeader('Authorization', `Bearer ${token ?? ''}`);
        xhr.onload = () => {
          console.log('[Upload] status:', xhr.status, xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Server ${xhr.status}: ${xhr.responseText}`));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      resetForm();
      Alert.alert('Success', 'Video uploaded successfully!');
    } catch (err: any) {
      console.error('[Upload error]', err);
      Alert.alert('Upload failed', err?.message ?? String(err));
    } finally {
      setUploading(false);
    }
  };

  const s = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 76,
      alignSelf: 'center',
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.teal,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 100,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center' as const,
    },
    sheetOption: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: 16,
    },
    sheetIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.tealLight,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    sheetOptionLabel: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.text,
    },
    sheetOptionSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    cancelButton: {
      marginTop: 16,
      paddingVertical: 14,
      alignItems: 'center' as const,
      borderRadius: 12,
      backgroundColor: colors.cancelBg,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.cancelText,
    },
    categoryLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textMuted,
      marginBottom: 10,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    categoryRow: {
      flexDirection: 'row' as const,
      gap: 10,
      marginBottom: 20,
    },
    categoryChip: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.teal,
      backgroundColor: colors.tealLight,
    },
    categoryChipActive: {
      backgroundColor: colors.teal,
      borderColor: colors.teal,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.teal,
    },
    categoryChipTextActive: {
      color: '#fff',
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 4,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.inputText,
      backgroundColor: colors.inputBg,
      marginBottom: 14,
    },
    inputMultiline: {
      height: 80,
      paddingTop: 10,
    },
  });

  return (
    <>
      {/* Floating + Button — hidden in controlled mode */}
      {!controlled && (
        <TouchableOpacity
          style={s.fab}
          onPress={() => setModalVisible(true)}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="add" size={32} color="#fff" />
          )}
        </TouchableOpacity>
      )}

      {/* Action Sheet Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={s.backdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Upload Video</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.fieldLabel}>Title</Text>
              <TextInput
                style={s.input}
                placeholder="Enter video title"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />

              <Text style={s.fieldLabel}>Description</Text>
              <TextInput
                style={[s.input, s.inputMultiline]}
                placeholder="Enter a short description (optional)"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />

              <Text style={s.categoryLabel}>Category</Text>
              <View style={s.categoryRow}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[s.categoryChip, active && s.categoryChipActive]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={18}
                        color={active ? '#fff' : colors.teal}
                      />
                      <Text style={[s.categoryChipText, active && s.categoryChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={s.sheetOption} onPress={pickVideo}>
                <View style={s.sheetIconBox}>
                  <Ionicons name="image-outline" size={22} color={colors.teal} />
                </View>
                <View>
                  <Text style={s.sheetOptionLabel}>Choose from Library</Text>
                  <Text style={s.sheetOptionSub}>Pick a video from your gallery</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.cancelButton}
                onPress={closeModal}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
