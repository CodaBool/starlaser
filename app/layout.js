// can write embed rules here for platforms like twitter
export const metadata = {
  title: 'Maps',
  description: 'Community Designed Maps',
}

// allows for mobile devices to properly style
export const viewport = {
  userScalable: false,
}

import './global.css'
import Provider from '@/components/provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" style={{touchAction: "none"}}>
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
