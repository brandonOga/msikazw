import type { Notification } from '../app/context/StoreContext';

type Role = 'buyer' | 'seller' | 'admin';

export interface NotificationDestination {
  path: string;
  params?: Record<string, string>;
}

// Where clicking a notification should take the user, based on who they are
// and what the notification is about. Mirrors each dashboard's own tab names.
export function getNotificationDestination(n: Notification, role: Role): NotificationDestination {
  if (role === 'admin') {
    if (n.title === 'New Seller Application') {
      return { path: '/admin-dashboard', params: { tab: 'stores', filter: 'pending' } };
    }
    return { path: '/admin-dashboard', params: { tab: 'notifications' } };
  }

  if (role === 'seller') {
    if (n.type === 'order') return { path: '/seller-dashboard', params: { tab: 'orders' } };
    if (n.type === 'quotation') return { path: '/seller-dashboard', params: { tab: 'quotations' } };
    return { path: '/seller-dashboard', params: { tab: 'notifications' } };
  }

  // buyer
  if (n.type === 'order') return { path: '/dashboard', params: { tab: 'orders' } };
  return { path: '/dashboard', params: { tab: 'notifications' } };
}
