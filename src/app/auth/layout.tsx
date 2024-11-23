export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex h-screen w-full items-center justify-center px-4">
      {children}
    </main>
  )
}
