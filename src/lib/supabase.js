import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yrsadnsmvqwanjzfdivc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2FkbnNtdnF3YW5qemZkaXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTQ2NzUsImV4cCI6MjA4OTU3MDY3NX0.yOf91fZj8kCf2oGc4sT9KlclkJdEFDgHhxBvHBSL5Xg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// OpenFreeMap — completely free, no API key, beautiful OSM tiles
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright'
