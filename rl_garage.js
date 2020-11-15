const Browser = require("./browser");
const {
    promisify
} = require("util");
const fs = require("fs");
const { Console } = require("console");
const writeFile = promisify(fs.writeFile);

class RL_garage extends Browser {
    constructor(DB) {
        super();

        this.db = DB;

        this.db.forEach((elem) => {
            elem.check = elem.Name.split(": ").pop().toLowerCase();
        }); 

        return (async () => {
            await super.browser();

            return this;
        })();
    }

    async types() {
        const types = [{
                href: "https://rocket-league.com/items/bodies",
                original: ["Body"]
            },
            {
                href: "https://rocket-league.com/items/wheels",
                original: ["Wheels"]
            },
            {
                href: "https://rocket-league.com/items/boosts",
                original: ["Boost"]
            },
            {
                href: "https://rocket-league.com/items/antennas",
                original: ["Antenna"]
            },
            {
                href: "https://rocket-league.com/items/decals",
                original: ["Skin"]
            },
            {
                href: "https://rocket-league.com/items/toppers",
                original: ["Hat"]
            },
            {
                href: "https://rocket-league.com/items/trails",
                original: ["SupersonicTrail"]
            },
            {
                href: "https://rocket-league.com/items/explosions",
                original: ["GoalExplosion"]
            },
            {
                href: "https://rocket-league.com/items/paints",
                original: ["PaintFinish"]
            },
            {
                href: "https://rocket-league.com/items/banners",
                original: ["PlayerBanner"]
            },
            {
                href: "https://rocket-league.com/items/engines",
                original: ["EngineAudio"]
            },
            {
                href: "https://rocket-league.com/items/borders",
                original: ["PlayerAvatarBorder"]
            },
            {
                href: "https://rocket-league.com/items/crates",
                original: ["Blueprint", "PremiumInventory"]
            }
        ];

        let result = [];
        let missing = [];

        for (let i = 0; i < types.length; i++) {
            await this.page.goto(types[i].href);
            let items = await this.items(types[i].original);
            result = result.concat(items.result);
            missing = missing.concat(items.missing);
        }

        console.log(`"id-rl-garage" not found in DB:`);
        missing = [...new Set(missing)];
        missing = {missing};
        console.log(missing);
        writeFile(`./output/missing.json`, JSON.stringify(missing), function (err) {
            if (err) {
                return console.log(err);
            }
        });

        return result;
    }

    async items(type) {
        return await this.page.evaluate((DB, type) => {
            let result = [];
            let missing = [];

            // Remove duplicated items in https://rocket-league.com/items/crates
            if (type[0] === "Blueprint") {
                let elements = document.querySelectorAll(".rlg-item-group-content");
                for (var i = 0; i < elements.length; i++) {
                    let h1 = elements[i].querySelectorAll("h1")[0];
                    if (h1.innerText !== "Archived items") {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }
            }

            let items = document.querySelectorAll(".rlg-item__container");

            items.forEach((item) => {
                let attributes = {};
                let attributeNames = item.getAttributeNames();
                attributeNames = attributeNames.filter(x => x !== 'class');

                attributeNames.forEach((elem) => {
                    let data = item.getAttribute(elem);
                    if (data === "" || data === "true") {
                        data = true;
                    } else if (data === "false") {
                        data = false;
                    }
                    attributes[elem.split("data-")[1]] = data;
                });

                let itemExt = item.querySelectorAll(".rlg-items-item")[0];

                let tradelock = item.querySelectorAll(".tradelock");
                if (tradelock.length !== 0) {
                    attributes.tradelock = true;
                } else {
                    attributes.tradelock = false;
                }

                attributes.src = `https://rocket-league.com${itemExt.getElementsByTagName("img")[0].getAttribute("src")}`;

                attributes["id-rl-garage"] = itemExt.getAttribute("data-id");

                type.forEach((elem) => {
                    let name_check = attributes["name"];

                    if (name_check.includes('(Alpha Reward)')) {
                        name_check = name_check.replace(' (Alpha Reward)', '');
                        name_check = `(Alpha Reward) ${name_check}`;
                    }

                    if (attributes.editionname === "Inverted") {
                        name_check = `${name_check}: Inverted`;
                    }

                    if (name_check === "Samus' Gunship") {
                        name_check = "Samus's Gunship";
                    }

                    if (name_check === "Blast Off") {
                        name_check = "Blast-Off";
                    }

                    if (attributes.category === "Crates") {
                        if (name_check.includes('(Unlocked)')) {
                            name_check = name_check.replace(' Crate', '');
                            name_check = `Crate - ${name_check}`;
                        }

                        if (name_check.includes('Blueprint')) {
                            name_check = name_check.replace(' Blueprint', '');
                        }

                        if (name_check === "Beach Blast") {
                            name_check = "RL Beach Blast";
                        }
                    }

                    name_check = name_check.toLowerCase();

                    let data;

                    if (name_check === "credits") {
                        data = DB.find(x => x.check === name_check);
                    } else {
                        data = DB.find(x => x.Type === elem && x.check === name_check);
                    }


                    if (data) {
                        attributes["db"] = data;
                        delete attributes["db"].check;
                    } else {
                        missing.push(attributes["id-rl-garage"]);
                    }
                });

                result.push(attributes);
            });
            return {result: result, missing: missing};
        }, this.db, type);
    }

    async downloadAssets(data) {
        if (!fs.existsSync("./output/assets")) {
            fs.mkdirSync("./output/assets");
        }
        for (let i = 0; i < data.length; i++) {
            let source = await this.page.goto(data[i].src);
            let name;
            if (data[i].db) {
                name = `${data[i].db.Id}.${data[i].src.split(".").pop()}`;
            } else {
                name = data[i].src.split("/").pop();
            }
            writeFile(`./output/assets/${name}`, await source.buffer(), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    }

    async close(){
        await super.close();
    }
}

module.exports = RL_garage;