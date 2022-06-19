import { writable, derived, type Readable, type Subscriber, type Unsubscriber } from 'svelte/store';
import { setContext, getContext } from 'svelte';
export type NotificationType = 'default' | 'info' | 'success' | 'warning' | 'error';
export interface INotification {
	id: string;
	type: NotificationType;
	message: string;
	timeout: number;
}

export type NotificationStore = {
	subscribe: (this: void, run: Subscriber<INotification[]>) => Unsubscriber;
	send: (message: string, type?: NotificationType, timeout?: number) => void;
	default: (message: string, timeout?: number) => void;
	info: (message: string, timeout?: number) => void;
	success: (message: string, timeout?: number) => void;
	warning: (message: string, timeout?: number) => void;
	error: (message: string, timeout?: number) => void;
};

export function createNotificationStore(timeout?: number) {
	const _notifications = writable<INotification[]>([]);

	function send(message: string, type: NotificationType = 'default', timeout = 2500) {
		_notifications.update((state) => {
			return [...state, { id: id(), type, message, timeout }];
		});
	}

	const notifications: Readable<INotification[]> = derived(
		_notifications,
		($_notifications, set) => {
			set($_notifications);
			if ($_notifications.length > 0) {
				const timer = setTimeout(() => {
					_notifications.update((state) => {
						state.shift();
						return state;
					});
				}, $_notifications[0].timeout);
				return () => {
					clearTimeout(timer);
				};
			}
		}
	);
	const { subscribe } = notifications;

	const notifStore = {
		subscribe,
		send,
		default: (msg: string, timeout?: number) => send(msg, 'default', timeout),
		info: (msg: string, timeout?: number) => send(msg, 'info', timeout),
		success: (msg: string, timeout?: number) => send(msg, 'success', timeout),
		warning: (msg: string, timeout?: number) => send(msg, 'warning', timeout),
		error: (msg: string, timeout?: number) => send(msg, 'error', timeout)
	};

	setContext('notifications', notifStore);
}

function id() {
	return '_' + Math.random().toString(36).slice(2, 9);
}

export function getNotificationsStore() {
	const notifStore: undefined | NotificationStore = getContext('notifications');
	if (notifStore !== undefined) {
		return notifStore as NotificationStore;
	} else {
		createNotificationStore();
		return getContext('notifications') as NotificationStore;
	}
}
