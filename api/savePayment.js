import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    
    const { date, amount } = JSON.parse(req.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.from('payments').upsert({ date, amount });

    if (error) return res.status(500).json(error);
    res.status(200).json({ success: true });
}