require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable() {
    console.log("Testing connection to 'job_applications'...");

    // Attempt to select. Since RLS is on and we are anon, 
    // this should return data: [] (empty) if table exists,
    // or an error if the table does NOT exist.
    const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.error("❌ FAILED: Table 'job_applications' does not exist.");
            console.error("Did you run the migration SQL?");
        } else {
            console.log("✅ Table exists (but RLS prevented access, which is correct for anon).");
            console.log("Error details (expected):", error.message);
        }
    } else {
        console.log("✅ Table exists and is accessible.");
        console.log("Data returned:", data);
    }
}

testTable();
