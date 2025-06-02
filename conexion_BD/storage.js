// Suparbase Storage
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_URL_SUPARBASE,
  process.env.NEXT_PUBLIC_API_KEY_SUPABASE,
);

// Subir imagen
const { data, error } = await supabase.storage
  .from('user-images')
  .upload(`public/${file.name}`, file);

// Obtener URL pública
const url = supabase.storage
  .from('user-images')
  .getPublicUrl(`public/${file.name}`);