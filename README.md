# Rl garage assets
Bot created with the sole intention of generating a list of all the thumbnails of the rocket league assets.

Due to the encryption of the original files, I collect all the data and images, from [RL Garage](https://rocket-league.com/items)

It still has a few items that are not detected well, but it only hovers around 100 objects, it is still working on it.

List of items not available: https://github.com/kaiserdj/rl-garage-assets/wiki/Items-not-available

### Example output

 - Map of items with information: https://github.com/kaiserdj/rl-garage-assets/blob/main/output/data.json
	 
   Raw: https://raw.githubusercontent.com/kaiserdj/rl-garage-assets/main/output/data.json
 - List thumbnails: https://github.com/kaiserdj/rl-garage-assets/tree/main/output/assets
 ![image](https://user-images.githubusercontent.com/5487950/99161112-f20de180-26ee-11eb-8512-34c6413bf5a7.png)

### Install
Clone this project

```bash
> git clone https://github.com/kaiserdj/rl-garage-assets.git
> cd rl-garage-assets
```

Install the dependencies:

```bash
> npm install
```

### Usage
1. run the bot

```bash
> npm run
```

### Update rocket league items db

- Run rocket league with BM mod ([bakkesmod](https://www.bakkesmod.com/))
- Open the console (F6)
- Run the command: `dumpitems` 
- Copy the generated `items.csv` file in the directory:
	> C: \ Program Files (x86) \ Steam \ steamapps \ common \ rocketleague \ Binaries \ Win64
	
	(default is that directory)
- Paste the file `items.csv`, in the input folder of the rl-garage-assets project

## Contributing

For bugs, questions, and discussions please use the [Github Issues](https://github.com/kaiserdj/rl-garage-assets/issues)

Pull requests are welcome! If you see something you'd like to add, please do. For drastic changes, please open an issue first.

## Donating

You can support the maintainer of this project through the link below

[![Support via PayPal](https://cdn.rawgit.com/twolfson/paypal-github-button/1.0.0/dist/button.svg)](https://www.paypal.me/kaiserdj/)

## Disclaimer

I'm just a fan, I have no rights to the Rocket League game.
All material on Rocket League belongs to Psyonix, Inc.
