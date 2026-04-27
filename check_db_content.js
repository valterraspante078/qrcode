const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Carrega o .env da raiz do projeto
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltam variáveis de ambiente!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPost() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content')
    .eq('slug', 'qr-code-personalizado')
    .single();

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('--- CONTENT START ---');
    console.log(data.content);
    console.log('--- CONTENT END ---');
    console.log('ID:', data.id);
  }
}

checkPost();
