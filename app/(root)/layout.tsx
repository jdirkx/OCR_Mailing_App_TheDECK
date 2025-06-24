import Navbar from "@/app/components/Navbar"

export default function layout({ children }: Readonly<{ children: React.ReactNode}>) {
    return (
        <main className="font-work-sans bg-white">
            <Navbar />
            {children}
        </main>
    );
}