import "./globals.css"

export const metadata = {
  title: "3D Farm Game",
  description: "A 3D farming game built with Next.js and React Three Fiber",
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='ru' suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
