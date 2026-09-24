import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  collection, query, orderBy, limit, onSnapshot,
  doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const notifCol = collection(db, 'notifications', user.uid, 'items');
    const q = query(notifCol, orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setNotifications(items);
      setUnreadCount(items.filter((item) => !item.readAt).length);
    }, (err) => {
      console.warn('Lỗi khi lắng nghe thông báo:', err);
    });

    return unsubscribe;
  }, [user]);

  // Đánh dấu 1 thông báo đã đọc
  const markAsRead = async (notifId) => {
    if (!user || !notifId) return;
    try {
      const ref = doc(db, 'notifications', user.uid, 'items', notifId);
      await updateDoc(ref, { readAt: serverTimestamp() });
    } catch (err) {
      console.error('Không thể đánh dấu đã đọc:', err);
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.readAt);
    await Promise.allSettled(
      unread.map((n) =>
        updateDoc(doc(db, 'notifications', user.uid, 'items', n.id), {
          readAt: serverTimestamp(),
        })
      )
    );
  };

  // Hàm tạo thông báo gửi tới targetUserId
  // firestore.rules: người gửi phải là admin, hoặc là người mua/brand của đơn orderId
  const sendNotification = async (targetUserId, { type, title, message, link, orderId }) => {
    if (!targetUserId || !user) return;
    try {
      const notifCol = collection(db, 'notifications', targetUserId, 'items');
      await addDoc(notifCol, {
        type: type || 'general',
        title: title || 'Thông báo mới',
        message: message || '',
        link: link || '',
        fromUid: user.uid,
        ...(orderId ? { orderId } : {}),
        readAt: null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Không thể gửi thông báo:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      sendNotification: () => {},
    };
  }
  return context;
}
