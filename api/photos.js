// api/photos.js
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const downloadPhoto = async (base64Photo, fileName) => {
  try {
    // For iOS and Android
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    
    // Write the base64 image to a file
    await RNFS.writeFile(path, base64Photo, 'base64');
    
    // Share the file (this will allow user to save/share)
    await Share.open({
      url: Platform.OS === 'android' ? `file://${path}` : path,
      title: 'Save Photo',
      type: 'image/jpeg',
    });
    
    return { success: true, path };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const deletePhotoFromDatabase = async (photoId, userId) => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('YOUR_API_ENDPOINT/photos/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete photo');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};