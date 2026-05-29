import { createAdminClient } from '@/lib/supabase/admin';
import { PickupPointsTable } from '@/components/admin/PickupPointsTable';
import type { PickupPointRow } from '@/components/admin/PickupPointFormModal';

async function getPickupPoints(): Promise<PickupPointRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');
  return (data ?? []) as PickupPointRow[];
}

export default async function PickupPointsPage() {
  const points = await getPickupPoints();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">
          Points de retrait
        </h2>
        <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">
          Gérez vos boutiques partenaires Click &amp; Collect. Activez un point pour le rendre visible au checkout.
        </p>
      </div>

      <PickupPointsTable points={points} />
    </div>
  );
}
