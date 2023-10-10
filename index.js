const RL_garage = require("./rl_garage");
const {
    promisify
} = require("util");
const fs = require("fs");
const writeFile = promisify(fs.writeFile);

async function run() {
    if (!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
    }
    let rl_garage = await new RL_garage();
    let data = await rl_garage.types();
    writeFile(`./output/data.json`, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    
    await rl_garage.close();
    console.log("Complete download Assets");
};

run();