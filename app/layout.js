export const metadata = {
  title: 'Maps',
  description: 'Community Designed Maps',
}
import './global.css'
import Provider from '@/components/provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
