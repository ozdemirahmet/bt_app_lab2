import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function triggerSelectionHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Ignore haptic failures on unsupported devices or simulators
  }
}

export async function triggerLightImpact(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore haptic failures on unsupported devices or simulators
  }
}

export async function triggerSuccessHaptic(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore haptic failures on unsupported devices or simulators
  }
}
