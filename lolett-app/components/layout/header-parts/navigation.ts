export interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

export const navigation: NavItem[] = [
  { name: 'Accueil', href: '/' },
  { name: 'Nouveautés', href: '/nouveautes' },
  {
    name: 'Shop',
    href: '/shop',
    children: [
      { name: 'Homme', href: '/shop/homme' },
      { name: 'Femme', href: '/shop/femme' },
    ],
  },
  { name: 'Notre Histoire', href: '/notre-histoire' },
  { name: 'Contact', href: '/contact' },
];
