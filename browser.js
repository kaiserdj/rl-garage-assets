const puppeteer = require("puppeteer-extra");
puppeteer.use(require("puppeteer-extra-plugin-stealth")());

let skippedResources = [];
class Browser {
    async browser () {
        this.browser = await puppeteer.launch({"headless": false, userDataDir: "Data"});
        this.page = await this.browser.newPage();
        await this.page.setViewport({"width": 1920, "height": 1080});
        await this.page.setBypassCSP(true);
        await this.page.setDefaultTimeout(30000);
        await this.page.setRequestInterception(true);
        await this.page.on("request", (req) => {
            let requestUrl = req._url.split("?")[0].split("#")[0];
            if (req.resourceType() === "stylesheet" || req.resourceType() === "font" || skippedResources.some((resource) => requestUrl.indexOf(resource) !== -1)) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }

    async close () {
        this.browser.close();
    }
}

module.exports = Browser;