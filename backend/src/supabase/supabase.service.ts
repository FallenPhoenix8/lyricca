import { Injectable } from "@nestjs/common"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

@Injectable()
export class SupabaseService extends SupabaseClient {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL environment variable is not set.")
    }
    if (!URL.parse(supabaseUrl)) {
      throw new Error(`SUPABASE_URL=${supabaseUrl} is not a valid URL.`)
    }
    if (!supabaseKey) {
      throw new Error("SUPABASE_SECRET_KEY environment variable is not set.")
    }
    super(supabaseUrl, supabaseKey)
  }
}
