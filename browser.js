const puppeteer = require("puppeteer-extra");
puppeteer.use(require("puppeteer-extra-plugin-stealth")());

class Browser {
    async browser () {
        this.browser = await puppeteer.launch({"headless": false, userDataDir: "Data"});
        this.page = await this.browser.newPage();
        await this.page.setViewport({"width": 1920, "height": 1080});
        await this.page.setBypassCSP(true);
        await this.page.setDefaultTimeout(30000);
        await this.page.setRequestInterception(true);
        await this.page.on("request", (req) => {
            if (req.resourceType() === "image" || 
            req.resourceType() === "stylesheet" || 
            req.resourceType() === "font" || 
            req.resourceType() === "beacon" || 
            req.resourceType() === "csp_report" || 
            req.resourceType() === "imageset" || 
            req.resourceType() === "media" || 
            req.resourceType() === "object" || 
            req.resourceType() === "object_subrequest" || 
            req.resourceType() === "ping" || 
            req.resourceType() === "script" || 
            req.resourceType() === "speculative" || 
            req.resourceType() === "sub_frame" || 
            req.resourceType() === "web_manifest" || 
            req.resourceType() === "websocket" || 
            req.resourceType() === "xml_dtd" || 
            req.resourceType() === "xmlhttprequest" || 
            req.resourceType() === "xslt" || 
            req.resourceType() === "other") {
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