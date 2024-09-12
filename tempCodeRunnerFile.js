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

                    // Improved image detection logic
                    const imageData = await page.evaluate(() => {
                        const resultDiv = document.querySelector('#result');
                        if (!resultDiv) return null;

                        const imageElement = resultDiv.querySelector('img');
                        if (!imageElement) return null;

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
                    console.error(`Error processing ID ${id}:`, error.message);
                }

                count++;
            }
        }
    }

    await browser.close();
}