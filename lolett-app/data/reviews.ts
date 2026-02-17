import type { Review } from '@/types';

export const reviews: Review[] = [
  {
    id: 'rev-001',
    author: 'Marie L.',
    rating: 5,
    comment:
      'La robe provençale est sublime ! Qualité au top et livraison rapide. Je recommande à 100%.',
    createdAt: '2024-06-10T00:00:00Z',
  },
  {
    id: 'rev-002',
    author: 'Thomas B.',
    rating: 5,
    comment:
      'Enfin une marque qui comprend le style méditerranéen. La chemise en lin est parfaite.',
    createdAt: '2024-06-08T00:00:00Z',
  },
  {
    id: 'rev-003',
    author: 'Sophie M.',
    rating: 5,
    comment: 'Le panier tressé ne me quitte plus. De la plage au resto, il va avec tout !',
    createdAt: '2024-06-05T00:00:00Z',
  },
  {
    id: 'rev-004',
    author: 'Pierre D.',
    rating: 4,
    comment: "Très content du chino sable. Coupe impeccable. J'attends les nouvelles couleurs.",
    createdAt: '2024-06-02T00:00:00Z',
  },
];
