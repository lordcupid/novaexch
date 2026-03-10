// ===== SUPABASE CONFIGURATION =====
// Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard → Project Settings → API

const SUPABASE_URL = 'https://enzmtttpzhsunloppabk.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuem10dHRwemhzdW5sb3BwYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDQ1NDYsImV4cCI6MjA4ODU4MDU0Nn0.O85VqZTR0KoAParC3gjeOEWEnL183Am6NfHHq7sJnM8';

// Initialize the Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized successfully');

// ===== AUTH HELPERS =====

async function signUp(email, password, metadata) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: metadata // { first_name, last_name, phone, country }
        }
    });
    return { data, error };
}

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'login.html';
    }
    return { error };
}

async function getUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
}

async function getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    return { session, error };
}

// ===== AUTH GUARD =====
// Call this on protected pages (dashboard, etc.)
async function requireAuth() {
    const { session } = await getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

// ===== DATABASE HELPERS =====

// Portfolio
async function getPortfolio(userId) {
    const { data, error } = await supabaseClient
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();
    return { data, error };
}

async function getAssets(userId) {
    const { data, error } = await supabaseClient
        .from('user_assets')
        .select('*')
        .eq('user_id', userId)
        .order('value_usd', { ascending: false });
    return { data, error };
}

// Transactions
async function getTransactions(userId, limit = 10) {
    const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    return { data, error };
}

async function createTransaction(transaction) {
    const { data, error } = await supabaseClient
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
    return { data, error };
}

// User Profile
async function getProfile(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

async function updateProfile(userId, updates) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

// Broker
async function getAssignedBroker(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('broker_id, brokers(*)')
        .eq('id', userId)
        .single();
    return { data, error };
}

// Market data
async function getMarketPrices() {
    const { data, error } = await supabaseClient
        .from('market_prices')
        .select('*')
        .order('market_cap', { ascending: false });
    return { data, error };
}
