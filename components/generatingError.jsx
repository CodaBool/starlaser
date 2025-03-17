import { ArrowLeft, Clock, Clock12, Github, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundPage({ map }) {
  return (
    <div className='text-gray-600 select-text' style={{
      background: 'linear-gradient(90deg, #FEFEE3 25%, #FDFD96 25%, #FDFD96 50%, #FEFEE3 50%, #FEFEE3 75%, #FDFD96 75%, #FDFD96 100%)',
      backgroundSize: '20px 20px',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: "column"
    }}>
      <Link href={`/${map}`} className="mb-4">
        <ArrowLeft size={42} />
      </Link>
      <h1 className='text-3xl font-bold'>Map Not Found</h1>

      <div className="flex items-center my-6">
        <Clock12 className="mr-2 animate-spin" />
        <span>TLDR: Maps changes take 5 minutes to take effect</span>
      </div>

      <p className='text-lg mt-2 text-black'>Uh oh, I couldn't find your map. Usually this is because your map is still being generated</p>
      <p className='text-lg text-black'>to save on costs, I use aggressive caching. This unfortunately means changes to maps take 5 minutes to refresh/revalidate in the cache</p>
      <p className='text-lg text-black'>However, if it's been over an hour, there is likely something wrong. Here are some things you can try:</p>

      <ul className='text-lg mt-2 list-disc list-inside'>
        <li>Ensure your map is visible in your account's export page</li>
        <li>Ensure your map is in a published state</li>
        <li>Use the copy code button and try entering this into your URL instead</li>
        <li>Try in an incognito browser</li>
        <li>Safely recreate your map and publish. Make sure to make a backup after every action to ensure no data is lost.</li>
      </ul>

      <p className='text-lg text-black mt-4'>If you are still experiencing issues, feel free to reach out:</p>

      <div className='flex flex-col items-center mt-6 space-y-4'>
        <a href="mailto:codabool@pm.me" className='flex items-center text-xl text-black'>
          <Mail className='mr-2' /> email <b className='pl-2'>codabool@pm.me</b>
        </a>
        <a href="https://discord.gg/foundryvtt" target="_blank" className='flex items-center text-xl text-black'>
          <MessageCircle className='mr-2' />search for and DM <span className="mx-1 font-bold">CodaBool</span> in FoundryVTT Discord
        </a>
        <a href="https://github.com/codabool/stargazer.vercel.app/issues" target="_blank" className='flex items-center text-xl text-black'>
          <Github className='mr-2' /> open an issue
        </a>
      </div>

      <div style={{ position: 'absolute', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Image src="/pom.gif" unoptimized alt="the fantastic mr. purin" width={300} height={300} priority style={{ width: "auto", height: 'auto' }} />
      </div>
    </div>
  )
}
