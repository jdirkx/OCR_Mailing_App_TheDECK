import Navbar from "@/components/Navbar"

export default function Home({ children}: Readonly<{ children: React.ReactNode}>) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}