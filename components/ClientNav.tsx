'use client';

import { usePathname } from 'next/navigation';
import Nav from './nav';

export default function ClientNav() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  console.log('ClientNav: pathname=', pathname, 'isAdminRoute=', isAdminRoute);

  if (isAdminRoute) return null;
  return <Nav />;
}