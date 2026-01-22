import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const ALLOWED_DOMAIN = '@safrasecifras.com.br';
const MAX_EMAIL_LENGTH = 254;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    // Input validation
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Email inválido' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Trim and normalize
    const normalizedEmail = email.trim().toLowerCase();

    // Length validation
    if (normalizedEmail.length === 0 || normalizedEmail.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Email inválido' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format validation
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Formato de email inválido' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Domain validation
    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Apenas emails @safrasecifras.com.br são permitidos' 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ valid: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Don't log sensitive information
    return new Response(
      JSON.stringify({ 
        valid: false,
        message: 'Erro ao validar email' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
