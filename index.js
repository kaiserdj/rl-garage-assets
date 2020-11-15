const RL_garage = require("./rl_garage");
const csv = require("csvtojson");
const iconv = require("iconv-lite");
const {
    promisify
} = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function run() {
    if (!fs.existsSync("./output")) {
        fs.mkdirSync("./output");
    }
    let DB = await getOriginalItemList();
    let rl_garage = await new RL_garage(DB);
    let data = await rl_garage.types();
    writeFile(`./output/data.json`, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    
    await rl_garage.downloadAssets(data);
    await rl_garage.close();
    console.log("Complete download Assets");

    let results = await countLostItems(DB, data);
    console.log(results);
};

async function getOriginalItemList() {
    const csvFilePath = './input/items.csv';

    const originalFile = await readFile(csvFilePath, {
        encoding: 'binary'
    });
    const decodedFile = iconv.decode(originalFile, 'iso88591');

    return await csv({
            noheader: false,
            headers: ['Id', 'Type', 'Data', 'Name']
        })
        .fromString(decodedFile)
}

async function countLostItems(Db, items){
    let result = {};

    result.totalItemsDb = Db.length;

    result.totalItemsAssets = items.length;

    result.totalItemsFound = 0;

    result.totalItemsMissing = 0;

    result.totalItemsMissing = 0;

    for(const elem of Db) {
        let check = items.find(x => {
            if(x.db){
                if(x.db.Id === elem.Id){
                    return true;
                }
            }
            return false;
        });

        if(check){
            result.totalItemsFound++;
        }else{
            result.totalItemsMissing++;
        }
    }

    for(const elem of  items) {
        if (!elem.db){
            result.totalItemsMissing++;
        }
    }

    return result;
}

run();