import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: settings } = await supabase.from('settings').select('value').eq('id', 1).single();
    const { data: paymentsRaw } = await supabase.from('payments').select('*');

    const payments = {};
    paymentsRaw?.forEach(p => payments[p.date] = p.amount);

    res.status(200).json({ base: settings?.value || 0, payments });
}