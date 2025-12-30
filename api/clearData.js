import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Barcha to'lovlarni o'chirish
    const { error: err1 } = await supabase.from('payments').delete().neq('amount', -1);
    // Maoshni 0 ga tushirish
    const { error: err2 } = await supabase.from('settings').upsert({ id: 1, value: 0 });

    if (err1 || err2) return res.status(500).json({ error: "O'chirishda xatolik" });
    
    res.status(200).json({ success: true });
}