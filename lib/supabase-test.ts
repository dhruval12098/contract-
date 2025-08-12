import { supabase } from './supabaseClient';

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('agencies')
      .select('count')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        details: error
      };
    }

    // Test auth service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return {
        success: false,
        message: `Auth service failed: ${authError.message}`,
        details: authError
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful',
      details: {
        database: 'Connected',
        auth: 'Connected',
        session: authData.session ? 'Active' : 'None'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${(error as Error).message}`,
      details: error
    };
  }
}

// Function to check environment variables
export function checkEnvironmentVariables(): {
  success: boolean;
  message: string;
  details: any;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const issues: string[] = [];
  
  if (!supabaseUrl) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  } else {
    try {
      new URL(supabaseUrl);
    } catch {
      issues.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }

  if (!supabaseAnonKey) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 100) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  return {
    success: issues.length === 0,
    message: issues.length === 0 
      ? 'Environment variables are properly configured' 
      : `Configuration issues found: ${issues.join(', ')}`,
    details: {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing',
      issues
    }
  };
}