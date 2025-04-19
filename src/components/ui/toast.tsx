import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "./use-toast";

export function Toast() {
	const { toasts } = useToast();

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<AnimatePresence>
				{toasts.map((toast, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="bg-white rounded-lg shadow-lg p-4 mb-2"
					>
						{toast.title && <div className="font-bold mb-1">{toast.title}</div>}
						{toast.description && (
							<div className="text-sm text-gray-600">{toast.description}</div>
						)}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
