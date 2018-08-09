// load the texture we need
// setup is provided by logic.js

// load interface and background
PIXI.loader
	.add('interface0', 'images/interface0.PNG')
    .add('background2', 'images/backgrounds/background-0-2.png');

// load sprite by type2frame
/*
PIXI.loader
	//.add('bunny.png', 'images/bunny.png')
    .add('unit-002-0.png','images/anime/unit-002-0.png')
    .add('unit-131-0.png','images/anime/unit-131-0.png')
    .add('unit-000-0.png','images/anime/unit-000-0.png')
    .add('unit-001-0.png','images/anime/unit-001-0.png')
    .add('unit-003-0.png','images/anime/unit-003-0.png')
*/
for(let type in type2frame){
    for(let i=0;i<4;i++){
        let name = type2frame[type][i];
        let url = 'images/anime/' + name;
        PIXI.loader.add(name, url);
    }
}

//load flags
PIXI.loader
    .add('flag-3-0.png','images/flags/flag-3-0.png')
    .add('flag-78-0.png','images/flags/flag-78-0.png')

// load button images
PIXI.loader
    .add('command-0-0.png','images/buttons/command-0-0.png')
    .add('command-0-1.png','images/buttons/command-0-1.png')
    .add('command-0-2.png','images/buttons/command-0-2.png')
    .add('command-0-3.png','images/buttons/command-0-3.png')

// start game when all assets are loaded
PIXI.loader
	.load(setup);