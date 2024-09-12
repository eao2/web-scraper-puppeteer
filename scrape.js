const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Constants for ID generation
// e = [10, 30, 50, 70, 90] // eregtei bish bol
const e = [0, 20, 40, 60, 80]; // emegtei bish bol

const f = [
    // "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "Ө", "П", 
    // "Р", "С", "Т", 
    "У", 
    // "Ү", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я"
];

// const d = [
//     "А", "Б", "В", "Г", "Д", 
//     "Е", "Ё", 
//     "Ж", 
//     "З", "И",
//     "Й", 
//     "К", 
//     "Л", "М", "Н",
//     "О",
//     "Ө", "П", "Р", "С",
//     "Т", "У", "Ү", "Ф",
//     "Х", 
//     "Ц", "Ч", "Ш", "Щ", "Ъ",
//     "Ы", "Ь", "Э", "Ю", "Я"
// ];

// Uncomment and modify these lines if you want to use different sets of letters
// const d = ["А", "Б", "В", "Г", "Д", "Ж", "К", "О", "Х"];
const d = ["К", "Ж", "Д", "Х", "О", "Г", "А", "Б", "В"];
// const d = ["Г", "А", "В"];
// const d = ["Ж", "Д", "А", "В"];
// const d = ['А', 'В', 'Д', 'Ж', 'И', 'Й', 'К'];

const date = "042726"; // Z.Davaatseren

async function scrape() {
    const browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== "false",
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
            "--disable-notifications",
        ],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    try {
        console.log(`Navigating to https://nmes.vercel.app/`);
        await page.goto(`https://nmes.vercel.app/`);

        console.log('Extracting data...');
        const data = await page.evaluate(() => {
            // Your data extraction code here
            return document.title;
        });

        console.log(`Extracted data: ${data}`);
    } catch (error) {
        console.error('Error during scraping:', error);
    }
    await browser.close();
}

async function saveToSupabase(id, imageSource) {
    try {
        const { data, error } = await supabase
            .from('scraped_data')
            .insert({ id: id, image_source: imageSource });

        if (error) {
            console.error('Error inserting data into Supabase:', error);
        } else {
            console.log('Data inserted successfully into Supabase:', id);
        }
    } catch (error) {
        console.error('Exception when saving to Supabase:', error);
    }
}

module.exports = { scrape };