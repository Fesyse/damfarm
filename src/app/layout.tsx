import "./globals.css";

export const metadata = {
	title: "DamFarm - Веселая ферма",
	description:
		"Веселая ферма предоставляет возможности ухода за животными заработка денег и вкладываения этих денег в акции",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<body>{children}</body>
		</html>
	);
}
