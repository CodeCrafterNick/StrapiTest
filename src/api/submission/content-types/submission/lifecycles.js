const puppeteer = require('puppeteer');

module.exports = {
  async beforeUpdate(event) {
    const { params, query } = event;

    const existingSubmission = await strapi.entityService.findOne("api::submission.submission", params.where.id, {
      populate: { politician: true, tags: true },
    });

    if (!existingSubmission) {
      console.error(`No submission found with ID: ${params.where.id}`);
      return;
    }

    if (params.data.approve === 'Approved' && existingSubmission.citation) {
      let politicianId = params.data.politician?.connect?.length > 0 ? params.data.politician.connect[0].id : existingSubmission.politician?.id;
      let contentMatch = false;

      try {
        const browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(existingSubmission.citation, { waitUntil: 'networkidle2' });
        const pageContent = await page.evaluate(() => document.body.innerText);
        await browser.close();

        const searchTextLower = existingSubmission.content.toLowerCase().trim();
        const pageContentLower = pageContent.toLowerCase();

        contentMatch = pageContentLower.includes(searchTextLower);

        const quoteData = {
          content: existingSubmission.content,
          date: existingSubmission.date,
          citation: existingSubmission.citation,
          context: existingSubmission.context,
          politician: politicianId,
          citationVerified: contentMatch,
        };

        if (contentMatch) {
          // Create the quote and publish it if content matches
          console.log(`Content found in the citation page.`);
          await strapi.entityService.create('api::quote.quote', {
            data: {
              ...quoteData,
              publishedAt: new Date(), // This publishes the quote
            },
          });
        } else {
          // Create the quote but leave it in draft if content does not match
          console.log("Submission content does not match the citation page content.");
          await strapi.entityService.create('api::quote.quote', {
            data: {
              ...quoteData,
              // Don't set publishedAt to leave it in draft
            },
          });
        }
      } catch (error) {
        console.error("Error processing content with Puppeteer:", error);
      }
    }
  }
};
