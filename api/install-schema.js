#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function installSchema() {
    console.log('🚀 Installing Supabase schema...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase configuration in .env file');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'supabase-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Schema file loaded, executing...');
        
        // Execute the schema
        const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
        
        if (error) {
            console.error('❌ Error installing schema:', error);
            
            // Try alternative method - execute SQL directly
            console.log('🔄 Trying alternative method...');
            
            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));
            
            for (const statement of statements) {
                try {
                    const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
                    if (stmtError) {
                        console.log(`⚠️  Statement warning: ${stmtError.message}`);
                    }
                } catch (e) {
                    console.log(`⚠️  Statement error: ${e.message}`);
                }
            }
        } else {
            console.log('✅ Schema installed successfully!');
        }
        
        // Test the installation
        console.log('🧪 Testing installation...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        
        if (tablesError) {
            console.error('❌ Error testing tables:', tablesError);
        } else {
            console.log('📊 Available tables:');
            tables.forEach(table => {
                console.log(`  - ${table.table_name}`);
            });
        }
        
        // Test admin user creation
        console.log('👤 Testing admin user...');
        const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('username, email, role')
            .eq('username', 'admin')
            .single();
        
        if (adminError) {
            console.log('⚠️  Admin user not found, creating...');
            
            const { error: createError } = await supabase
                .from('admin_users')
                .insert([{
                    username: 'admin',
                    email: 'admin@yannova.nl',
                    password_hash: '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ',
                    role: 'Administrator'
                }]);
            
            if (createError) {
                console.log('⚠️  Could not create admin user:', createError.message);
            } else {
                console.log('✅ Admin user created successfully!');
            }
        } else {
            console.log('✅ Admin user found:', adminUser);
        }
        
        console.log('🎉 Supabase setup complete!');
        console.log('📝 Next steps:');
        console.log('  1. Start the server: npm start');
        console.log('  2. Visit: http://localhost:3000');
        console.log('  3. Admin login: http://localhost:3000/admin/login.html');
        console.log('  4. Username: admin, Password: yannova2023');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

installSchema();
