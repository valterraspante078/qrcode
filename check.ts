import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'qr-code-personalizado')
        .single();
    
    if (error) {
        console.error(error);
    } else {
        console.log('--- START ---');
        console.log(data.content);
        console.log('--- END ---');
    }
}

check();
