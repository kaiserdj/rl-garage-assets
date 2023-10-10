const Browser = require("./browser");
const { promisify } = require("util");
const fs = require("fs");
const writeFile = promisify(fs.writeFile);

class RL_garage extends Browser {
    constructor() {
        super();

        return (async () => {
            await super.browser();

            return this;
        })();
    }

    async types() {
        const types = [
            "https://rocket-league.com/items/misc",
            "https://rocket-league.com/items/bodies",
            "https://rocket-league.com/items/decals",
            "https://rocket-league.com/items/paints",
            "https://rocket-league.com/items/wheels",
            "https://rocket-league.com/items/boosts",
            "https://rocket-league.com/items/toppers",
            "https://rocket-league.com/items/antennas",
            "https://rocket-league.com/items/explosions",
            "https://rocket-league.com/items/trails",
            "https://rocket-league.com/items/anthems",
            "https://rocket-league.com/items/banners",
            "https://rocket-league.com/items/borders",
            "https://rocket-league.com/items/engines",
            "https://rocket-league.com/items/titles",
            "https://rocket-league.com/items/stickers",
            "https://rocket-league.com/items/avatars",
        ];

        let data = [];

        for await (const type of types) {
            await this.page.goto(type);
            let items = await this.items();
            for await (let item of items) {
                data.push(await this.loadItem(item));
            }
        }

        return data;
    }

    async items() {
        return await this.page.evaluate(() => {
            let result = [];

            let items = document.querySelectorAll(
                ".rlg-items-container > div > div:nth-child(2) > .rlg-item__container"
            );

            items.forEach((item) => {
                let attributes = {};

                attributes["id-rl-garage"] = parseInt(
                    item.getElementsByTagName("a")[0].getAttribute("data-id")
                );
                attributes.name = item.querySelector("h2").innerText;
                attributes.link =
                    location.origin +
                    item.getElementsByTagName("a")[0].getAttribute("href");
                attributes.src =
                    location.origin +
                    item
                        .querySelector(".rlg-item__itemimage")
                        .getAttribute("src");

                result.push(attributes);
            });

            return result;
        });
    }

    async loadItem(item) {
        let pageItem = await this.browser.newPage();
        await pageItem.setBypassCSP(true);
        await pageItem.setDefaultTimeout(30000);
        await pageItem.setRequestInterception(true);
        await pageItem.on("request", (req) => {
            if (
                req.resourceType() === "image" ||
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
                req.resourceType() === "other"
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await pageItem.goto(item.link);

        let checkTitle = await pageItem.evaluate(
            () => document.querySelector(".rlg-page__title > h1").innerText
        );

        while (checkTitle != item.name) {
            console.log("Active web protection, waiting to continue");
            await wait(3000);
            await pageItem.reload();
            checkTitle = await pageItem.evaluate(
                () => document.querySelector(".rlg-page__title > h1").innerText
            );
            if (checkTitle == item.name) {
                console.log("Web protection passed");
            }
        }

        let result = await pageItem.evaluate(() => {
            let result = {};
            let info = document.querySelectorAll(".rlg-item-details-table tr");

            info.forEach((data) => {
                let type = data.querySelector("th").innerText;

                data = data.querySelector("td");

                if (data.querySelectorAll("ul").length == 0) {
                    if (data.querySelectorAll("p").length > 1) {
                        let list = data.querySelectorAll("p");
                        data = [];

                        list.forEach((item) => data.push(item.innerText));
                        data = data.toString();
                    } else {
                        if (data.innerText.toLowerCase() == "yes") {
                            data = true;
                        } else if (data.innerText.toLowerCase() == "no") {
                            data = false;
                        } else {
                            data = data.innerText;
                        }
                    }
                } else {
                    let list = data.querySelectorAll("li");
                    data = [];

                    list.forEach((item) => data.push(item.innerText));
                    data = data.toString();
                }

                result[type] = data;
            });

            let checkPaints = document.querySelector(".rlg-itemdb-paints");

            if (checkPaints.innerHTML != "\n") {
                result.paints = [];
                let paints = checkPaints.querySelectorAll("a");

                paints.forEach((paint) => {
                    let dataPaint = {};
                    dataPaint.color = paint.querySelector("h2").innerText;
                    dataPaint.src =
                        location.origin +
                        paint.querySelector("img").getAttribute("src");

                    result.paints.push(dataPaint);
                });
            }

            return result;
        });

        Object.assign(item, result);

        await this.downloadAssets(item);

        await pageItem.close();

        return item;
    }

    async downloadAssets(item) {
        let pageDownloader = await this.browser.newPage();

        if (!fs.existsSync("./output/assets")) {
            fs.mkdirSync("./output/assets");
        }

        if (item.paints) {
            for await (let elem of item.paints) {
                let source = await pageDownloader.goto(elem.src);
                let color = "";
                if (elem.color != "Unpainted") {
                    color = `_${elem.color.trim()}`;
                }
                let name = `${item["id-rl-garage"]}_${item.name}${color}.png`;

                writeFile(
                    `./output/assets/${name}`,
                    await source.buffer(),
                    function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    }
                );
            }
        } else {
            let source = await pageDownloader.goto(item.src);
            let name = `${item["id-rl-garage"]}_${item.name}.png`;
            writeFile(
                `./output/assets/${name}`,
                await source.buffer(),
                function (err) {
                    if (err) {
                        return console.log(err);
                    }
                }
            );
        }

        console.log(`Download of item "${item.name}" completed`);

        await pageDownloader.close();
    }

    async close() {
        await super.close();
    }
}

module.exports = RL_garage;

const wait = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms);
    });
};
