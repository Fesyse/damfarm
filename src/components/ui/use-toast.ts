import { useCallback, useState } from "react";

interface ToastOptions {
	title?: string;
	description?: string;
}

export function useToast() {
	const [toasts, setToasts] = useState<ToastOptions[]>([]);

	const toast = useCallback(({ title, description }: ToastOptions) => {
		setToasts((prev) => [...prev, { title, description }]);
		setTimeout(() => {
			setToasts((prev) => prev.slice(1));
		}, 3000);
	}, []);

	return { toast, toasts };
}
