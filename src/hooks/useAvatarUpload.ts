import { useState, useCallback } from 'react'
import { Alert, ActionSheetIOS, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/store/profileStore'

const BUCKET = 'avatars'

/**
 * Handles picking (library or camera), square-cropping, resizing and uploading
 * a profile photo to Supabase Storage, then syncs profiles.avatar_url + store.
 */
export function useAvatarUpload(userId: string | null) {
  const setAvatarUrl = useProfileStore((s) => s.setAvatarUrl)
  const [uploading, setUploading] = useState(false)

  const processAndUpload = useCallback(
    async (uri: string) => {
      if (!userId) return
      setUploading(true)
      try {
        // Resize the (already square-cropped) image to 300×300 and compress, using
        // the SDK 57 contextual API (manipulateAsync is deprecated).
        const rendered = await ImageManipulator.manipulate(uri)
          .resize({ width: 300, height: 300 })
          .renderAsync()
        const manipulated = await rendered.saveAsync({
          compress: 0.8,
          format: SaveFormat.PNG,
          base64: true,
        })
        if (!manipulated.base64) throw new Error('Failed to process image')

        const bytes = decodeBase64(manipulated.base64)
        const path = `${userId}/avatar.png`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, bytes, { contentType: 'image/png', upsert: true })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        // Cache-bust so expo-image refreshes after an overwrite.
        const publicUrl = `${data.publicUrl}?v=${Date.now()}`

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId)
        if (updateError) throw updateError

        setAvatarUrl(publicUrl)
      } catch (err) {
        // Surface the underlying reason — TestFlight builds have __DEV__ off, so
        // the console warn alone is invisible while we diagnose bucket/RLS setup.
        const reason = err instanceof Error ? err.message : String(err)
        Alert.alert('Upload failed', `Could not update your photo.\n\n${reason}`)
        console.warn('Avatar upload error', err)
      } finally {
        setUploading(false)
      }
    },
    [userId, setAvatarUrl],
  )

  const pickFromLibrary = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to choose a picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (!result.canceled) await processAndUpload(result.assets[0].uri)
  }, [processAndUpload])

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a picture.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (!result.canceled) await processAndUpload(result.assets[0].uri)
  }, [processAndUpload])

  const chooseAvatar = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Choose from Library', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (i) => {
          if (i === 0) takePhoto()
          else if (i === 1) pickFromLibrary()
        },
      )
    } else {
      Alert.alert('Profile photo', undefined, [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }, [takePhoto, pickFromLibrary])

  return { chooseAvatar, uploading }
}

/** Decode a base64 string to a Uint8Array for Supabase Storage upload. */
function decodeBase64(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const lookup = new Uint8Array(256)
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i

  const len = base64.length
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  const byteLength = (len * 3) / 4 - padding
  const bytes = new Uint8Array(byteLength)

  let p = 0
  for (let i = 0; i < len; i += 4) {
    const e1 = lookup[base64.charCodeAt(i)]
    const e2 = lookup[base64.charCodeAt(i + 1)]
    const e3 = lookup[base64.charCodeAt(i + 2)]
    const e4 = lookup[base64.charCodeAt(i + 3)]
    if (p < byteLength) bytes[p++] = (e1 << 2) | (e2 >> 4)
    if (p < byteLength) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2)
    if (p < byteLength) bytes[p++] = ((e3 & 3) << 6) | e4
  }
  return bytes
}
