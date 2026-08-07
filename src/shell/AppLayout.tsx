import { Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

/** Full-height shell: page content + site footer on every route. */
export function AppLayout() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
