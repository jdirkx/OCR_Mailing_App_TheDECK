import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth, signOut, signIn } from "@/auth";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className='px-5 py-3 bg-white shadow-sm font-work-sans'>
      <nav className='flex justify-between items-center'>
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={144} height={30} />
        </Link>

        <div className='flex items-center gap-5 text-black'>
          {session ? (
            <>
              <form
                action={async () => { 
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className='cursor-pointer'>
                  <span>Logout</span>
                </button>
              </form>
              
              <Link href={'/user/${session.user?.id}'}>
                <span>{session.user?.name}</span>
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn('google');
              }}
            >
				<button type="submit" className="cursor-pointer">
					Login
				</button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
};

// // ... existing imports
// import { auth, signOut, signIn } from "@/auth";

// const Navbar = async () => {
//   const session = await auth();
//   const isAuthorized = session?.user?.email === "your@specific-email.com";

//   return (
//     <header className='px-5 py-3 bg-white shadow-sm font-work-sans'>
//       {/* ... other nav code */}
//       <div className='flex items-center gap-5 text-black'>
//         {isAuthorized ? (
//           <>
//             <form action={async () => { "use server"; await signOut(); }}>
//               <button type="submit">Logout</button>
//             </form>
//             <span>{session.user?.name}</span>
//           </>
//         ) : (
//           <form action={async () => { "use server"; await signIn("google"); }}>
//             <button type="submit">Login</button>
//           </form>
//         )}
        
//         {session && !isAuthorized && (
//           <div className="text-red-500">
//             Unauthorized email. Contact admin.
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

export default Navbar;