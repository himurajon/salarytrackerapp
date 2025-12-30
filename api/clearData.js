import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    await supabase.from('payments').delete().neq('amount', -1);
    await supabase.from('settings').upsert({ id: 1, value: 0 });

    res.status(200).json({ success: true });
}