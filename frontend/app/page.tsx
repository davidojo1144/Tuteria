 "use client";
 import Link from "next/link";
 export default function Page() {
   return (
     <main className="w-full min-h-screen flex items-center justify-center p-8">
       <div className="text-center space-y-4">
         <h1 className="text-2xl font-bold">Email Workflow Trigger Dashboard</h1>
         <p className="text-gray-600">Open the campaign page to compose and send.</p>
         <Link className="inline-block px-6 py-3 rounded-lg bg-primary text-white" href="/workflows/send-mail">
           Go to Compose Email
         </Link>
       </div>
     </main>
   );
 }
