// app/(setup)/layout.tsx
import { redirect } from 'next/navigation'
import { getUser, userHasIFCUsername } from '@/lib/supabase/user-actions'
import { headers } from 'next/headers'

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // // Get the current pathname
  // const headersList = headers()
  // const pathname = headersList.get('x-pathname') || '';
  // const isSuccessPage = pathname.includes('/setup/success');
  
  // // Only check for IFC username if not on success page
  // if (!isSuccessPage) {
  //   const user = await getUser();
  //   const { success } = await userHasIFCUsername();
    
  //   if (success) {
  //     redirect('/dashboard');
  //   }
  // }

  // Alternative way to check for IFC username
  // const user = await getUser();
  const { success } = await userHasIFCUsername();

  if (success) {
    redirect('/dashboard');
  }
  

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF0E6] p-4">
      {children}
    </div>
  );
}