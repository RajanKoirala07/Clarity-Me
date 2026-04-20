import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { BASE_URL } from '@/services/api';
import { getItem } from '@/services/storage';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TEAL = '#3D8B85';

export default function FloatingUploadButton() {
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const pickVideo = async () => {
    setModalVisible(false);
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

      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        name: video.fileName ?? 'upload.mp4',
        type: video.mimeType ?? 'video/mp4',
      } as any);

      const token = await getItem('accessToken');
      const res = await fetch(`${BASE_URL}/storage/upload-video`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');

      Alert.alert('Success', 'Video uploaded successfully!');
    } catch {
      Alert.alert('Upload failed', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.fab}
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

      {/* Action Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Upload Video</Text>

          <TouchableOpacity style={styles.sheetOption} onPress={pickVideo}>
            <View style={styles.sheetIconBox}>
              <Ionicons name="image-outline" size={22} color={TEAL} />
            </View>
            <View>
              <Text style={styles.sheetOptionLabel}>Choose from Library</Text>
              <Text style={styles.sheetOptionSub}>Pick a video from your gallery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 76,
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: TEAL,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
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
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E4A4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 16,
  },
  sheetIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6FAF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sheetOptionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
