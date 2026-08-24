import { Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

/**
 * Full-viewport column: main grows, footer sits at the bottom.
 * When content is taller than the screen, the page scrolls and the footer
 * stays at the end of the document (not fixed while scrolling).
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
