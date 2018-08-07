function shuffle(a){
    // Fisher-Yates shuffle
    var i,idx,x;
    for(i=a.length-1;i>0;i--){
        idx = Math.floor(Math.random() *(i+1));
        x = a[idx];
        a[idx] = a[i];
        a[i] = x;
    }
}

function graphics2texture(graphics, config){
    if(config && config.transparent){
        var renderer = PIXI.autoDetectRenderer(graphics.width, graphics.height, {transparent: true});
        //console.log('transparent')
    }
    else{
        var renderer = PIXI.autoDetectRenderer(graphics.width, graphics.height);
    }
    var stage = new PIXI.Container();
    stage.addChild(graphics);
    renderer.render(stage);
    var texture = PIXI.Texture.fromCanvas(renderer.view);
    return texture;
}

function drawUnitBox(x,y,unitData,isAttacker){
    /*
      unitData example:
      {
       name:'吴传心',
       type:'民兵',
       maxMorale:2,
       morale:1,
       maxStrength:100,
       strength:100,
       I:3,
       W:3,
       B:2,
       exp:0,
       lv:0,
       buff:0.15
      }
    */
    
    var battleSideBox = new PIXI.Sprite(graphicsTexture['battleSideBox']);
    battleSideBox.anchor.set(0.5);
    battleSideBox.x = x;
    battleSideBox.y = y;      
    //spriteMat[t][i].push({'box':battleSideBox});
    
    //app.stage.addChild(battleSideBox);
    
    var unitIcon = new PIXI.Sprite(PIXI.loader.resources[type2img[unitData.type]].texture);
    //unitIcon.anchor.set(0.5);
    if(!isAttacker)
        unitIcon.scale.x = -1;
    
    if(isAttacker)
        var nameColor = '#0000ee';
    else
        var nameColor = '#ee0000';
    var nameText = new PIXI.Text(unitData.name, {fontSize:10, fill:[nameColor]});
    var typeText = new PIXI.Text(unitData.type, {fontSize:10});
    var moraleText = new PIXI.Text(unitData.morale+'/'+unitData.maxMorale, {fontSize:10});
    //var strengthText = new PIXI.Text(unitData.strength + '/'+ unitData.maxStrength, {fontSize:12});
    var strengthText = new PIXI.Text(unitData.strength, {
        fontSize:15,
        fontWeight: 'bold',
        fill: ['#eeeeee'],
        stroke: '#222222',
        strokeThickness: 2});
    
    var descText = new PIXI.Text('I:' + unitData.I+" W:"+unitData.W+" B:" +unitData.B +" exp:"+unitData.exp+" (Lv"+unitData.lv+')', {fontSize:8});
    
    if(unitData.buff<0)
        var buffColor = '#ee0000'
    else if(unitData.buff == 0)
        var buffColor = '#000000'
    else
        var buffColor = '#00bb00'
    var buffText = new PIXI.Text(unitData.buff*100+'%', {fontSize:10, fill:[buffColor]});
    
    //unitIcon.anchor.set(0.5);
    unitIcon.x = x -80;
    if(!isAttacker)
        unitIcon.x+=50;
    unitIcon.y = y -30;
    
    nameText.x = x - 20;
    nameText.y = y - 30;
    
    typeText.x = x-20;
    typeText.y = y-15;
    
    moraleText.x = x-20;
    moraleText.y = y-0;
    
    strengthText.x = x - 50;
    strengthText.y = y;
    
    descText.x = x -75;
    descText.y = y+ 20;
    
    buffText.x = x+35;
    buffText.y = y-15;
    
    var spriteMap = {
        battleSideBox: battleSideBox,
        unitIcon: unitIcon,
        nameText: nameText,
        typeText: typeText,
        moraleText: moraleText,
        strengthText: strengthText,
        descText: descText,
        buffText: buffText
    }
    Object.keys(spriteMap).forEach(function(key){
        app.stage.addChild(spriteMap[key]);
    });
    
    return spriteMap;
    
}

function drawSideBar(x,y,text1,text2){
    
    //var spriteMap = {}
    
    var sideBarBox = new PIXI.Sprite(graphicsDynamicTexture['sideBarBox'].texture);
    //graphicsDynamicTexture['sideBarBox'].update(p);
    var spriteText1 = new PIXI.Text(text1, {fontSize:10, fill:['#eeeeee']});
    var spriteText2 = new PIXI.Text(text2, {fontSize:10, fill:['#eeeeee']});
    
    sideBarBox.x = x + 200;
    sideBarBox.y = y + 10;
    spriteText1.x = x + 220;
    spriteText1.y = y + 18;
    spriteText2.x = x + 405;
    spriteText2.y = y + 18;
    
    app.stage.addChild(sideBarBox);
    app.stage.addChild(spriteText1);
    app.stage.addChild(spriteText2);
    
    return {sideBarBox: sideBarBox,
            sideBarBoxUpdate: graphicsDynamicTexture['sideBarBox'].update,
            spriteText1: spriteText1,
            spriteText2: spriteText2};
    
}

function drawFactionGraph(x,y, atkInfo,defInfo, battleInfo){
    var battleUpperBox = new PIXI.Sprite(graphicsTexture['battleUpperBox']);
    battleUpperBox.x = x;
    battleUpperBox.y = y;
    app.stage.addChild(battleUpperBox);
    
    var flagAtk = new PIXI.Sprite(PIXI.loader.resources[faction2img[atkInfo['faction']]].texture)
    var flagDef = new PIXI.Sprite(PIXI.loader.resources[faction2img[defInfo['faction']]].texture)
    
    flagAtk.x = 10;
    flagAtk.y = 5;
    
    flagDef.x = 760;
    flagDef.y = 5;
    
    app.stage.addChild(flagAtk);
    app.stage.addChild(flagDef);
    
    var textFactionAtk = new PIXI.Text('攻方:'+atkInfo['faction'] + '\n补给:'+atkInfo['supply']+'/资金:'+atkInfo['money'], 
        {fontSize:11});
    
    var textFactionDef = new PIXI.Text('守方:'+defInfo['faction'] + '\n补给:'+defInfo['supply']+'/资金:'+defInfo['money'], 
        {fontSize:11});
    
    textFactionAtk.x = 50;
    textFactionAtk.y = 5;
    
    textFactionDef.anchor.set(1.0,0.0)
    textFactionDef.x = 750;
    textFactionDef.y = 5;
    
    
    app.stage.addChild(textFactionAtk);
    app.stage.addChild(textFactionDef);
    
    var sideBar = drawSideBar(x,y,
        battleInfo['location']+'之战 ['+battleInfo['terrain']+']',
        battleInfo['turn']+'/'+battleInfo['maxTurn']+'回合');
    sideBar['sideBarBoxUpdate'](atkInfo['strength'] / (atkInfo['strength'] + defInfo['strength'] + 1.0));
    
    return {
        battleUpperBox: battleUpperBox,
        flagAtk: flagAtk,
        flagDef: flagDef,
        textFactionAtk: textFactionAtk,
        textFactionDef: textFactionDef,
        sideBar: sideBar
    }
    
}

function drawFormationMat(){
    var formationTexture = PIXI.loader.resources[type2img['新军步兵']].texture;
    var formationMat = [];
    
    for(var t=0; t<2; t++){
        formationMat.push([]);
        for(var i=0; i<4; i++){
            formationMat[t].push([]);
            for(var j=0; j<5; j++){
                var sUnit = new PIXI.Sprite(formationTexture);
                if(t===0){
                    sUnit.x = 20 + j*40-5*i;
                    sUnit.y = 190 + 15*i;
                }
                else{
                    sUnit.scale.x = -1;
                    sUnit.x = 775 - j*40+5*i;
                    sUnit.y = 190 + 15*i;
                }
                app.stage.addChild(sUnit);
                formationMat[t][i].push(sUnit);
            }
        }
    }
    return formationMat
}




const app = new PIXI.Application({
    width: 800, 
    height: 600,                       
	backgroundColor:0xEEEEEE
});

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);


// init graphics texture
    
var graphicsTexture = (function(){
    
    var exports = {};
    var graphics;

    // draw two side counter box

    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xCCFFFF, 1);
    graphics.drawRect(1, 1, 160, 70);

    exports['battleSideBox'] = graphics2texture(graphics);

    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xFFFF00, 1);
    graphics.drawRect(1, 1, 160, 70);

    exports['battleSideBoxSelected'] = graphics2texture(graphics);
    
    // draw centering name box
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xFFFFFF, 1);
    graphics.drawRect(1, 1, 80, 20);
    
    exports['battleCenterBox'] = graphics2texture(graphics);
    
    // draw centering name box(grey)
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xbbbbbb, 1);
    graphics.drawRect(1, 1, 80, 20);
    
    exports['battleCenterBoxLapsed'] = graphics2texture(graphics);
    
    // draw centering name box(grey)
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0xee0000, 1);
    //graphics.beginFill(0xbbbbbb, 0.5); // transparent
    graphics.drawRect(1, 1, 80, 20);
    
    exports['battleCenterBoxSelectedBorder'] = graphics2texture(graphics, {transparent:true});
    
    // upper grey background
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xaaaaaa, 1);
    graphics.drawRect(1, 1, 799, 50);
    
    exports['battleUpperBox'] = graphics2texture(graphics);
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0xeeeeee, 1);
    graphics.drawRect(1, 1, 150, 20);
    
    exports['withdrawBox'] = graphics2texture(graphics);
    
    return exports;
})();

var graphicsDynamicTexture = (function(){
    
    var exports = {};
    
    exports['sideBarBox'] = (function(){
        var sideBarWidth = 400;
        var sideBarHeight = 30;
        
        var graphics = new PIXI.Graphics();
        var renderer = PIXI.autoDetectRenderer(sideBarWidth, sideBarHeight);
        var stage = new PIXI.Container();
        stage.addChild(graphics);
        //renderer.render(stage);
        var texture = PIXI.Texture.fromCanvas(renderer.view);
        
        
        function update(p){
            graphics.clear();
            // draw blue bar(attacker)
            graphics.lineStyle(2, 0x000000, 1);
            graphics.beginFill(0x0000FF, 1);
            graphics.drawRect(0, 0, sideBarWidth*p, sideBarHeight);
            // draw red bar(defender)
            graphics.lineStyle(2, 0x000000, 1);
            graphics.beginFill(0xFF0000, 1);
            graphics.drawRect(sideBarWidth*p, 0, sideBarWidth-2, sideBarHeight);
            // rerender and update to texture
            renderer.render(stage);
            texture.update();
        }
        
        return {texture: texture,
                update: update};
    })();
    
    return exports;
})();

var spriteManager = {}; // this manager will be imported into all sprites


var formationManager = {
    reset: function(){
        // static layout enemy is hidden and ally is displayed in fraction
        var idx = battleManager.unitSelected;
        var texture = PIXI.loader.resources[type2img[dataMat[idx[0]][idx[1]][idx[2]]['type']]].texture;
        var lossCount = Math.floor((1-dataMat[idx[0]][idx[1]][idx[2]]['strength'] / dataMat[idx[0]][idx[1]][idx[2]]['maxStrength'])*20);
        
        for(var t=0; t<2; t++){
            for(var i=0; i<4; i++){
                for(var j=0; j<5; j++){
                    if(t !== idx[0]){
                        spriteManager.formationMat[t][i][j].visible = false; // hide another side
                    }
                    else{
                        spriteManager.formationMat[t][i][j].texture = texture;
                        spriteManager.formationMat[t][i][j].visible = true;
                    }
                }
            }
        }
        
        for(var j=0; j<5; j++){
            for(var i=3; i>=0; i--){
                if(lossCount<=0)
                    break;
                spriteManager.formationMat[idx[0]][i][j].visible = false;
                lossCount--;
            }
        }
    }
}

var battleManager = {
    unitSelected: [0,1,1], // seleced idx i.e. [0,0,0]
    unitPrevSelected:[0,1,1],
    select:function(idx){
        var pidx = this.unitSelected;
        this.unitPrevSelected = pidx;
        this.unitSelected = idx;
        
        // reset focus, more better if move those logic into a independent location.
        spriteManager.spriteMat[pidx[0]][pidx[1]][pidx[2]]['battleSideBox'].texture = graphicsTexture['battleSideBox'];
        spriteManager.spriteMat[idx[0]][idx[1]][idx[2]]['battleSideBox'].texture = graphicsTexture['battleSideBoxSelected'];
    }
}

// load the texture we need
PIXI.loader
	.add('interface0', 'images/interface0.PNG')
    .add('background2', 'images/backgrounds/background-0-2.png')
	.add('bunny.png', 'images/bunny.png')
    .add('unit-002-0.png','images/anime/unit-002-0.png')
    .add('unit-131-0.png','images/anime/unit-131-0.png')
    .add('unit-000-0.png','images/anime/unit-000-0.png')
    .add('unit-001-0.png','images/anime/unit-001-0.png')
    .add('unit-003-0.png','images/anime/unit-003-0.png')
    .add('flag-3-0.png','images/flags/flag-3-0.png')
    .add('flag-78-0.png','images/flags/flag-78-0.png')
	.load(setup);
    
var faction2img = {
    '国民政府':'flag-3-0.png',
    '川康军':'flag-78-0.png'
}

function gameloop(delta){
    //console.log(delta);
    
}


function setup(loader, resources){
    // draw upper background
    battleBackground = new PIXI.Sprite(resources['background2'].texture);
    
    battleBackground.x = 0;
    battleBackground.y = 0;
    
    app.stage.addChild(battleBackground);
    
    // draw bottom background
	interface0 = new PIXI.Sprite(resources['interface0'].texture);
	
	interface0.x = 0;
	interface0.y = 300;
	
	app.stage.addChild(interface0);

    // draw gray box layout
    var spriteMat = []; // 2 * 3 * 2 sprite matrix, spriteMat[0,:,:] means attacker, spriteMat[:,0,0] means left-upper unit for attacker side. right-upper unit in defender side.
    
    for(var t=0;t<2;t++){
        spriteMat.push([])
        var sm_x,sm_y,step_x,step_y;
        if(t === 0){
            sm_x = 100;
            sm_y = 350;
            step_x = 170;
            step_y = 80;
        }
        else{
            sm_x = 700;
            sm_y = 350;
            step_x = -170;
            step_y = 80;
        }
        for(var i=0; i<3; i++){
            spriteMat[t].push([]);
            for(var j=0; j<2; j++){

                spriteMat[t][i][j] = drawUnitBox(sm_x + step_x*j, sm_y + step_y*i, dataMat[t][i][j], t === 0)
            }
        }
    }
    
    spriteManager.spriteMat = spriteMat;
    
    
    // draw centering labels
    
    var battleCenterBoxVector = [];

    var sm_x = 400;
    var sm_y = 320;
    for(var i=0;i<12;i++){
        var battleCenterBox = new PIXI.Sprite(graphicsTexture['battleCenterBox']);
        battleCenterBox.anchor.set(0.5);
        battleCenterBox.x = sm_x;
        battleCenterBox.y = sm_y + i*20;      
        app.stage.addChild(battleCenterBox);
        battleCenterBoxVector.push(battleCenterBox);
    }
    
    var pots = {};
    var I;
    for(var t=0;t<2;t++){
        for(var i=0;i<3;i++){
            for(var j=0;j<2;j++){
                I = dataMat[t][i][j]['I'];
                if(pots[I]){
                    pots[I].push([t,i,j]);
                }
                else{
                    pots[I] = [[t,i,j]]
                }
            }
        }
    }
    var idxs = Object.keys(pots).map(function(sn){return Number(sn)});
    idxs.sort(function(x,y){return x<y});
    var unitOrder = [];
    idxs.forEach(function(idx){
        var arr = pots[idx];
        shuffle(arr);
        unitOrder = unitOrder.concat(arr);
    });
    for(var i=0; i<12; i++){
        var idx = unitOrder[i];
        var name = dataMat[idx[0]][idx[1]][idx[2]]['name'];

        var color = idx[0] === 0 ? '#0000ee' : '#ee0000';
        var text = new PIXI.Text(name, {
            'fill':[color],
            fontSize:10
        });
        text.anchor.set(0.5);
        text.x = 400;
        text.y = 320 + i*20;
        app.stage.addChild(text);
    }
    
    spriteManager.battleCenterBoxVector = battleCenterBoxVector;
    
    spriteManager.formationMat = drawFormationMat();
    
    
    // draw up bar
    var factionSpriteMap = drawFactionGraph(0,0,{
        faction:'国民政府',
        supply:13,
        money:75,
        strength:700
    },{
        faction:'川康军',
        supply:1,
        money:4,
        strength:800
    },{
        location: '自贡',
        terrain: '山丘',
        turn:3,
        maxTurn:45
    });
    
    spriteManager.factionSpriteMap = factionSpriteMap;
    
    // draw withdraw layout
    
    var withdrawBox = new PIXI.Sprite(graphicsTexture['withdrawBox']);
    var withdrawText = new PIXI.Text('按此转进',{'fontSize': 10});
    withdrawBox.anchor.set(0.5);
    withdrawText.anchor.set(0.5);
    withdrawBox.x = 400;
    withdrawBox.y = 65;
    withdrawText.x = 400;
    withdrawText.y = 65;
    app.stage.addChild(withdrawBox);
    app.stage.addChild(withdrawText);
    
    spriteManager.withdrawSprite = {
        withdrawBox: withdrawBox,
        withdrawText: withdrawText
    }
    
    // select Peide Zhu
    //spriteMat[0][0][1]['battleSideBox'].texture = graphicsTexture["battleSideBoxSelected"];
    battleManager.select([0,0,1]);
    
    spriteManager.battleCenterBoxVector[0].texture = graphicsTexture.battleCenterBoxLapsed;
    spriteManager.battleCenterBoxVector[1].texture = graphicsTexture.battleCenterBoxLapsed;
    spriteManager.battleCenterBoxVector[2].texture = graphicsTexture.battleCenterBoxLapsed;
    
    
    var border = new PIXI.Sprite(graphicsTexture.battleCenterBoxSelectedBorder);
    border.anchor.set(0.5);
    border.x = 400;
    border.y = 320 + 2*20;
    app.stage.addChild(border);
    
    formationManager.reset();
    
    app.ticker.add(gameloop);
}
