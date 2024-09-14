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

    console.log("puppeteer start?")
    const browser = await puppeteer.launch({
        headless: process.env.HEADLESS === "false" ? false : 'shell',
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });

    console.log("puppeteer work?")

    const page = await browser.newPage();

    for (const fd of f) {
        for (const dd of d) {
            let count = 0;
            while (count < 100) {
                if (e.includes(count)) {
                    count += 10;
                    continue;
                }

                await page.goto("https://www2.1212.mn/sonirkholtoi/Human_new/", { waitUntil: 'networkidle0' });

                const id = `${fd}${dd}${date}${count.toString().padStart(2, '0')}`;

                await page.waitForSelector('#ContentPlaceHolder1_RegisterTextBox');
                await page.type('#ContentPlaceHolder1_RegisterTextBox', id);
                await page.keyboard.press('Enter');

                try {
                    // Wait for the result to load with a timeout
                    await page.waitForSelector('#result', { timeout: 10000 });

                    try {
                        // Wait for images inside the result div to load (with a longer timeout for dynamic content)
                        await page.waitForSelector('#result img', { timeout: 2000 }); // Wait up to 5 seconds
                        console.log('Images detected within #result div.');
                    
                        // Extract the images from the result div
                        const imageData = await page.evaluate(() => {
                            const resultDiv = document.querySelector('#result');
                            if (!resultDiv) {
                                console.log('No result div found.');
                                return null;
                            }
                    
                            const images = resultDiv.querySelectorAll('img');
                            console.log(`Number of images found: ${images.length}`);
                    
                            if (images.length === 0) {
                                console.log('No images found in the result div.');
                                return null;
                            }
                    
                            // If there are two images, select the second one; if only one, select that
                            const imageElement = images.length === 2 ? images[1] : images[0];
                    
                            return {
                                src: imageElement.src,
                                alt: imageElement.alt || '',
                                width: imageElement.width,
                                height: imageElement.height
                            };
                        });
                    
                        if (imageData && imageData.src) {
                            console.log(`Image found for ID ${id}:`, imageData);
                            await saveToSupabase(id, imageData.src);
                        } else {
                            console.log(`No image found for ID ${id}`);
                        }
                    } catch (error) {
                        console.error(`Error processing images for ID ${id}:`, error.message);
                    }
                    
                } catch (error) {
                    console.error(`Error processing ID ${id}:`, error.message);
                }

                count++;
            }
        }
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