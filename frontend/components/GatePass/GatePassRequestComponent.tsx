import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#7f1d1d';
const ACCENT = '#e09c15';
const LIGHT_TEXT = '#dbeafe';
const GRAY_TEXT = '#94a3b8';
const BORDER_COLOR = '#1e293b';
const BACKGROUND = '#FFFFFF';
const INPUT_BG = '#f9fafb';
const TEXT_COLOR = '#111827';

type GatePassFormData = {
  name: string;
  persons: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  reason: string;
};

type Props = {
  teacherId?: string;
  teacherName?: string;
};

export default function GatePassRequestComponent({ teacherId, teacherName }: Props) {
  const [formData, setFormData] = useState<GatePassFormData>({
    name: '',
    persons: '',
    date: '',
    time: '',
    phone: '',
    email: '',
    reason: '',
  });
  const [qrData, setQrData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<View | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const updateField = (field: keyof GatePassFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const onDateChange = (_event: unknown, nextDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    updateField('date', nextDate.toLocaleDateString('en-GB'));
  };

  const onTimeChange = (_event: unknown, nextTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (!nextTime) {
      return;
    }

    setSelectedTime(nextTime);
    const hours = nextTime.getHours();
    const minutes = nextTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    updateField('time', formattedTime);
  };

  const validateForm = (): boolean => {
    const { name, persons, date, time, phone, email, reason } = formData;

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter visitor/parent name');
      return false;
    }

    if (!persons.trim() || Number.isNaN(Number.parseInt(persons, 10))) {
      Alert.alert('Validation Error', 'Please enter a valid number of persons');
      return false;
    }

    if (Number.parseInt(persons, 10) < 1) {
      Alert.alert('Validation Error', 'Number of persons must be at least 1');
      return false;
    }

    if (!date.trim()) {
      Alert.alert('Validation Error', 'Please select the date');
      return false;
    }

    const selectedDateObj = new Date(date.split('/').reverse().join('-'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj < today) {
      Alert.alert('Validation Error', 'Please select a date that is today or in the future');
      return false;
    }

    if (!time.trim()) {
      Alert.alert('Validation Error', 'Please select the time');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter a phone number');
      return false;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address with @');
      return false;
    }

    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter the reason for visit');
      return false;
    }

    return true;
  };

  const generateQRCode = () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);

    try {
      const qrPayload = {
        teacher_id: teacherId || 'N/A',
        teacher_name: teacherName || 'Unknown',
        parent_name: formData.name,
        num_persons: formData.persons,
        date: formData.date,
        time: formData.time,
        phone: formData.phone,
        email: formData.email || 'N/A',
        reason: formData.reason,
        generated_at: new Date().toISOString(),
      };

      setQrData(JSON.stringify(qrPayload));
      setShowQR(true);
      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (error) {
      console.error('QR generation error:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      persons: '',
      date: '',
      time: '',
      phone: '',
      email: '',
      reason: '',
    });
    setQrData('');
    setShowQR(false);
  };

  const saveQRCode = async () => {
    if (!qrRef.current) {
      Alert.alert('Save failed', 'Unable to locate the QR code view.');
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow gallery access to save the QR code.');
        return;
      }

      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 0.9,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Campus Connect', asset, false).catch(() => null);
      Alert.alert('Saved', 'QR Code saved to your photo gallery.');
    } catch (error) {
      console.error('Save QR error:', error);
      Alert.alert('Save failed', 'Unable to save QR code. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons name="badge" size={28} color={PRIMARY} />
        <Text style={styles.headerTitle}>Gate Pass Request</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>New Gate Pass</Text>
        <View style={styles.divider} />
        <Text style={styles.instruction}>
          Fill in the details of visitors or parents for gate pass generation.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Visitor/Parent Name *</Text>
          <TextInput
            placeholder="e.g., John Smith"
            placeholderTextColor={GRAY_TEXT}
            style={styles.input}
            value={formData.name}
            onChangeText={value => updateField('name', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Persons *</Text>
          <TextInput
            placeholder="e.g., 2"
            placeholderTextColor={GRAY_TEXT}
            style={styles.input}
            keyboardType="number-pad"
            value={formData.persons}
            onChangeText={value => updateField('persons', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: formData.date ? TEXT_COLOR : GRAY_TEXT }}>
                {formData.date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            ) : null}
          </View>

          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Time *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
              <Text style={{ color: formData.time ? TEXT_COLOR : GRAY_TEXT }}>
                {formData.time || 'Select Time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker ? (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
                is24Hour={false}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            placeholder="e.g., 3001234567"
            placeholderTextColor={GRAY_TEXT}
            style={styles.input}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={value => updateField('phone', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            placeholder="e.g., parent@email.com"
            placeholderTextColor={GRAY_TEXT}
            style={styles.input}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={value => updateField('email', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reason for Visit *</Text>
          <TextInput
            placeholder="Enter the reason..."
            placeholderTextColor={GRAY_TEXT}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={formData.reason}
            onChangeText={value => updateField('reason', value)}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={generateQRCode}
            disabled={isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color={LIGHT_TEXT} size="small" />
            ) : (
              <>
                <MaterialIcons name="qr-code-2" size={20} color={LIGHT_TEXT} />
                <Text style={styles.buttonText}>Generate QR Code</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetForm}
            activeOpacity={0.85}
          >
            <MaterialIcons name="refresh" size={20} color={PRIMARY} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showQR && qrData ? (
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <MaterialIcons name="check-circle" size={24} color={PRIMARY} />
            <Text style={styles.qrTitle}>Gate Pass QR Code</Text>
          </View>

          <Text style={styles.qrInfo}>Share this QR code with {formData.name}</Text>

          <View ref={qrRef} collapsable={false} style={styles.qrCodeContainer}>
            <QRCode
              value={qrData}
              size={200}
              color={PRIMARY}
              backgroundColor={BACKGROUND}
            />
          </View>

          <View style={styles.qrDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Visitor:</Text>
              <Text style={styles.detailValue}>{formData.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Persons:</Text>
              <Text style={styles.detailValue}>{formData.persons}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time:</Text>
              <Text style={styles.detailValue}>{formData.date} {formData.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact:</Text>
              <Text style={styles.detailValue}>{formData.phone}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85} onPress={saveQRCode}>
            <MaterialIcons name="download" size={20} color={LIGHT_TEXT} />
            <Text style={styles.buttonText}>Save QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY,
    marginLeft: 12,
  },
  card: {
    backgroundColor: BACKGROUND,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
  },
  divider: {
    height: 1.5,
    backgroundColor: BORDER_COLOR,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 18,
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    fontSize: 14,
    color: TEXT_COLOR,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderColor: ACCENT,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f1f3',
    borderColor: BORDER_COLOR,
  },
  buttonText: {
    color: LIGHT_TEXT,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: PRIMARY,
  },
  qrCard: {
    backgroundColor: BACKGROUND,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: ACCENT,
    marginBottom: 20,
    elevation: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    marginLeft: 10,
  },
  qrInfo: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INPUT_BG,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  qrDetails: {
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY_TEXT,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_COLOR,
    flex: 1,
    textAlign: 'right',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ACCENT,
    gap: 8,
  },
  footer: {
    height: 20,
  },
});
