#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseIntegration() {
    console.log('🧪 Testing Supabase Integration...\n');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    let allTestsPassed = true;
    
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    try {
        const { data, error } = await supabase.from('chat_sessions').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Database connection successful');
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        allTestsPassed = false;
    }
    
    // Test 2: Chatbot API
    console.log('\n2️⃣ Testing chatbot API...');
    try {
        const response = await axios.post(`${BASE_URL}/api/chatbot`, {
            message: 'Test bericht',
            sessionId: 'test-session-123'
        });
        
        if (response.data.success) {
            console.log('✅ Chatbot API working');
            console.log('   Response:', response.data.response.substring(0, 50) + '...');
        } else {
            throw new Error('Chatbot API returned error');
        }
    } catch (error) {
        console.log('❌ Chatbot API failed:', error.message);
        allTestsPassed = false;
    }
    
    // Test 3: Quote Creation
    console.log('\n3️⃣ Testing quote creation...');
    try {
        const response = await axios.post(`${BASE_URL}/api/quotes`, {
            klantNaam: 'Test User',
            email: 'test@example.com',
            projectType: 'ramen',
            ramen: [{
                type: 'PVC',
                width: '200',
                height: '150',
                color: 'wit'
            }]
        });
        
        if (response.data.id) {
            console.log('✅ Quote creation successful');
            console.log('   Quote ID:', response.data.id);
        } else {
            throw new Error('Quote creation failed');
        }
    } catch (error) {
        console.log('❌ Quote creation failed:', error.message);
        allTestsPassed = false;
    }
    
    // Test 4: Admin Login
    console.log('\n4️⃣ Testing admin login...');
    try {
        const response = await axios.post(`${BASE_URL}/api/admin/login`, {
            username: 'admin',
            password: 'yannova2023'
        });
        
        if (response.data.success && response.data.token) {
            console.log('✅ Admin login successful');
            console.log('   Token received:', response.data.token.substring(0, 20) + '...');
        } else {
            throw new Error('Admin login failed');
        }
    } catch (error) {
        console.log('❌ Admin login failed:', error.message);
        allTestsPassed = false;
    }
    
    // Test 5: Database Tables
    console.log('\n5️⃣ Testing database tables...');
    const tables = ['chat_sessions', 'chat_messages', 'admin_users', 'quotes'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) throw error;
            console.log(`✅ Table '${table}' accessible`);
        } catch (error) {
            console.log(`❌ Table '${table}' error:`, error.message);
            allTestsPassed = false;
        }
    }
    
    // Test 6: Frontend Access
    console.log('\n6️⃣ Testing frontend access...');
    try {
        const response = await axios.get(`${BASE_URL}/`);
        if (response.status === 200 && response.data.includes('Yannova')) {
            console.log('✅ Frontend accessible');
        } else {
            throw new Error('Frontend not accessible');
        }
    } catch (error) {
        console.log('❌ Frontend access failed:', error.message);
        allTestsPassed = false;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Supabase is fully functional!');
        console.log('\n📝 Available endpoints:');
        console.log('   • Website: http://localhost:3000');
        console.log('   • Admin: http://localhost:3000/admin/login.html');
        console.log('   • API: http://localhost:3000/api/');
        console.log('\n👤 Admin credentials:');
        console.log('   • Username: admin');
        console.log('   • Password: yannova2023');
    } else {
        console.log('❌ Some tests failed. Check the errors above.');
    }
    console.log('='.repeat(50));
}

testSupabaseIntegration().catch(console.error);
