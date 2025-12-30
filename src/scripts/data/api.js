import CONFIG from '../config';

const ENDPOINTS = {
  ENDPOINT: `${CONFIG.BASE_URL}/your/endpoint/here`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.ENDPOINT);
  return await fetchResponse.json();
}

/**
 * Add story to API
 * @param {string} token - Auth token
 * @param {FormData} formData - Story data
 */
export async function addStory(token, formData) {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseJson = await response.json();
    
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal menambah cerita');
    }

    return responseJson;
  } catch (error) {
    console.error('Error adding story:', error);
    throw error;
  }
}

/**
 * Subscribe ke push notification
 * @param {Object} subscriptionData - Data subscription dari PushManager
 * @param {string} token - Auth token
 */
export async function subscribePushNotification(subscriptionData, token) {
  try {
    const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys
      })
    });

    const responseJson = await response.json();
    
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal subscribe push notification');
    }

    return responseJson;
  } catch (error) {
    console.error('Error subscribing push notification:', error);
    throw error;
  }
}

/**
 * Unsubscribe dari push notification
 * @param {Object} subscriptionData - Data subscription yang akan di-unsubscribe
 * @param {string} token - Auth token
 */
export async function unsubscribePushNotification(subscriptionData, token) {
  try {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE_NOTIFICATION, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint
      })
    });

    const responseJson = await response.json();
    
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal unsubscribe push notification');
    }

    return responseJson;
  } catch (error) {
    console.error('Error unsubscribing push notification:', error);
    throw error;
  }
}