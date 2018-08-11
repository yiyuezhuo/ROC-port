function getLossCount(strength, maxStrength){

    return Math.floor((1-strength / maxStrength)*20);
}

function makeFalseMatrix(){
    var mat = [];
    for(var t=0; t<2; t++){
        mat.push([]);
        for(var i=0;i<3;i++){
            mat[t].push([])
            for(var j=0;j<2;j++){
                mat[t][i].push(false);
            }
        }
    }
    return mat;
}

function makeRangeType(idx, range){
    // range \in \{ 'none','forward', 'line', 'shock', 'all' \}
    var mat = makeFalseMatrix();
    var setTrue = function(t,i,j){
        if(dataMat[t][i][j] === undefined || dataMat[t][i][j].strength === 0)
            mat[t][i][j] = false;
        else{
            mat[t][i][j] =  true;
        }
    }
    switch(range){
        case 'none':
            break;
        case 'forward':
            if(idx[2] == 1){
                //if(dataMat[1-idx[0]][idx[1]][1])
                //mat[1-idx[0]][idx[1]][1] = true;
                var opposite = dataMat[1-idx[0]][idx[1]][1];
                if(opposite === undefined || opposite.strength === 0){
                    return makeRangeType(idx, 'line');
                }
                else{
                    setTrue(1-idx[0], idx[1], 1);
                }
            }
            break;
        case 'line':
            if(idx[2] == 1){
                //mat[1-idx[0]][0][1] = true;
                //mat[1-idx[0]][1][1] = true;
                //mat[1-idx[0]][2][1] = true;
                for(var i=0; i<3; i++)
                    setTrue(1-idx[0], i, 1);
            }
            break;
        case 'shock':
            if(idx[0] === 0){
                for(var i=0; i<3; i++)
                    setTrue(1-idx[0], i, 1);
            }
            else{
                for(var i=0; i<3; i++)
                    for(var j=0; j<2; j++)
                        setTrue(1-idx[0],i,j);
            }
            break;
        case 'all':
            for(var i=0; i<3; i++)
                for(var j=0; j<2; j++)
                    setTrue(1-idx[0],i,j);
            break;
        default:
            console.log('unknown range type');
            break;
    }
    return mat;
}

function makeRange(idx, type){
    // type here is unit type such as '民兵', which be mapped to range type such as 'line' by type2range
    // Return action type: melee','range','move','wait' -> 2*3*2 mask bool matrix
    let dUnit = dataMat[idx[0]][idx[1]][idx[2]];

    if(dUnit.morale >= 1){
        var meleeMat = makeRangeType(idx, type2range[type].melee);
        var rangeMat = makeRangeType(idx, type2range[type].range);
    }
    else{
        var meleeMat = makeFalseMatrix();
        var rangeMat = makeFalseMatrix();
    }
        
    var moveMat = makeFalseMatrix();
    moveMat[idx[0]][idx[1]][1-idx[2]] = idx[2] === 1 && dataMat[idx[0]][idx[1]][1-idx[2]] !== undefined;
    var waitMat = makeFalseMatrix();
    waitMat[idx[0]][idx[1]][idx[2]] = true;

    

    return {
        melee: meleeMat,
        range: rangeMat,
        move: moveMat,
        wait: waitMat
    };
}

function rangeDamage(unitAIdx, unitBIdx){
    var unitA = dataMat[unitAIdx[0]][unitAIdx[1]][unitAIdx[2]];
    var unitB = dataMat[unitBIdx[0]][unitBIdx[1]][unitBIdx[2]];
    var buff = 1 + unitA.buff - unitB.buff;
    var r = 0.5 + Math.random()/2;
    var frontLineBuff = 1.0;
    if(unitAIdx[2] == 1)
        frontLineBuff = 1.5;
    return Math.floor(Math.min(unitB.strength, 0.05 * unitA.strength * frontLineBuff * unitA.B * buff * r));
}

function meleeDamage(unitAIdx, unitBIdx){
    var unitA = dataMat[unitAIdx[0]][unitAIdx[1]][unitAIdx[2]];
    var unitB = dataMat[unitBIdx[0]][unitBIdx[1]][unitBIdx[2]];
    var bA = 1 + unitA.buff - unitB.buff;
    var bB = 1 + unitB.buff - unitA.buff;
    var sA = unitA.strength;
    var sB = unitB.strength;

    //var lossList = [];

    for(let i=0;i<5;i++){
        let rA = 0.5 + Math.random()/2;
        let rB = 0.5 + Math.random()/2;
        let lB = Math.min(sB, Math.ceil(0.025 * sA * unitA.W * bA * rA));
        let lA = Math.min(sA, Math.ceil(0.025 * sB * unitA.W * bA * rA));
        sA -= lA;
        sB -= lB;
        //lossList.push([lA,lB]);
    }
    return [unitA.strength - sA, unitB.strength - sB];
}

function graphics2texture(graphics, config){
    /*
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
    */
   var texture = PIXI.RenderTexture.create(graphics.width, graphics.height, config);
   app.renderer.render(graphics, texture);
   return texture;
}

function drawUnitBox(x,y,isAttacker){
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
    
    var unitIcon = new PIXI.Sprite(PIXI.loader.resources[type2img['民兵']].texture);
    //unitIcon.anchor.set(0.5);
    if(!isAttacker)
        unitIcon.scale.x = -1;
    
    if(isAttacker)
        var nameColor = '#0000ee';
    else
        var nameColor = '#ee0000';
    var nameText = new PIXI.Text('nameText', {fontSize:10, fill:[nameColor]});
    var typeText = new PIXI.Text('typeText', {fontSize:10});
    var moraleText = new PIXI.Text('moraleText', {fontSize:10});
    //var strengthText = new PIXI.Text(unitData.strength + '/'+ unitData.maxStrength, {fontSize:12});
    var strengthText = new PIXI.Text('strengthText', {
        fontSize:15,
        fontWeight: 'bold',
        fill: ['#eeeeee'],
        stroke: '#222222',
        strokeThickness: 2});
    
    var descText = new PIXI.Text('descText', {fontSize:8});
    /*
    if(unitData.buff<0)
        var buffColor = '#ee0000'
    else if(unitData.buff == 0)
        var buffColor = '#000000'
    else
        var buffColor = '#00bb00'
    */
    var buffColor = '#ee0000'
    var buffText = new PIXI.Text('buffText', {fontSize:10, fill:[buffColor]});

    var meleeButton = new PIXI.Sprite(PIXI.loader.resources['command-0-0.png'].texture);
    var rangeButton = new PIXI.Sprite(PIXI.loader.resources['command-0-1.png'].texture);
    var waitButton = new PIXI.Sprite(PIXI.loader.resources['command-0-2.png'].texture);
    var moveButton = new PIXI.Sprite(PIXI.loader.resources['command-0-3.png'].texture);
    var buttonList = [meleeButton,rangeButton,waitButton,moveButton];
    for(var i=0;i<buttonList.length;i++){
        var button = buttonList[i];
        button.anchor.set(0.5);

    }


    var buttonContainer = new PIXI.Container();
    buttonContainer.addChild(meleeButton, rangeButton, waitButton, moveButton);

    var tag = new PIXI.Sprite(PIXI.loader.resources['UnitTag-0-0.png'].texture);
    tag.anchor.set(0.5);
    tag.alpha = 0.5;
    
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

    meleeButton.x = x
    //meleeButton.y = y-10;
    meleeButton.y = y;

    rangeButton.x = x;
    rangeButton.y = y;

    waitButton.x = x;
    waitButton.y = y;

    moveButton.x = x;
    moveButton.y = y;

    tag.x = x;
    tag.y = y;


    var topContainer = new PIXI.Container();

    topContainer.addChild(unitIcon, nameText, typeText, moraleText, strengthText, descText, buffText, 
        buttonContainer, tag);
    //console.log(topContainer.children);
    
    
    var spriteMap = {
        battleSideBox: battleSideBox,
        unitIcon: unitIcon,
        nameText: nameText,
        typeText: typeText,
        moraleText: moraleText,
        strengthText: strengthText,
        descText: descText,
        buffText: buffText,
        topContainer: topContainer,
        meleeButton: meleeButton,
        rangeButton: rangeButton,
        waitButton: waitButton,
        moveButton: moveButton,
        buttonContainer: buttonContainer,
        tag: tag
    }

    
    app.stage.addChild(spriteMap.battleSideBox);
    app.stage.addChild(topContainer);
    
    return spriteMap;
    
}

function updateUnitBox(unitIdx){
    var spriteMap = spriteManager.spriteMat[unitIdx[0]][unitIdx[1]][unitIdx[2]];
    var unitData = dataMat[unitIdx[0]][unitIdx[1]][unitIdx[2]];
    var isAttacker = unitIdx[0] === 0;

    if(!unitData){
        spriteMap.battleSideBox.texture = graphicsTexture.battleSideBoxNull;
        spriteMap.topContainer.visible = false;
        return;
    }

    spriteMap.topContainer.visible = true;

    if(arrayEqual(unitIdx,battleManager.unitSelected)){
        spriteMap.battleSideBox.texture = graphicsTexture.battleSideBoxSelected;
    }
    else{
        spriteMap.battleSideBox.texture = graphicsTexture.battleSideBox;
    }

    spriteMap.unitIcon.texture = PIXI.loader.resources[type2img[unitData.type]].texture;

    if(isAttacker)
        var nameColor = '#0000ee';
    else
        var nameColor = '#ee0000';
    spriteMap.nameText.text = unitData.name;
    spriteMap.nameText.style.fill = [nameColor];

    spriteMap.typeText.text = unitData.type;

    spriteMap.moraleText.text = unitData.morale+'/'+unitData.maxMorale;

    spriteMap.strengthText.text = unitData.strength;

    spriteMap.descText.text = 'I:' + unitData.I+" W:"+unitData.W+" B:" +unitData.B +" exp:"+unitData.exp+" (Lv"+unitData.lv+')';

    if(unitData.buff<0)
        var buffColor = '#ee0000'
    else if(unitData.buff == 0)
        var buffColor = '#000000'
    else
        var buffColor = '#00bb00'

    spriteMap.buffText.text = unitData.buff*100+'%';
    spriteMap.buffText.style.fill = [buffColor];

    var idx = unitIdx;
    spriteMap.buttonContainer.visible = battleManager.buttonAvailable;

    spriteMap.meleeButton.visible = battleManager.rangeMap.melee[idx[0]][idx[1]][idx[2]];
    spriteMap.rangeButton.visible = battleManager.rangeMap.range[idx[0]][idx[1]][idx[2]];
    spriteMap.waitButton.visible = battleManager.rangeMap.wait[idx[0]][idx[1]][idx[2]];
    spriteMap.moveButton.visible = battleManager.rangeMap.move[idx[0]][idx[1]][idx[2]];

    //console.log(spriteMap.meleeButton.visible, spriteMap.rangeButton.visible);
    if(spriteMap.meleeButton.visible && spriteMap.rangeButton.visible){
        //console.log('detect conflict')
        spriteMap.meleeButton.y = spriteMap.battleSideBox.y - 17;
        spriteMap.rangeButton.y = spriteMap.battleSideBox.y + 17;
    }
    else{
        spriteMap.meleeButton.y = spriteMap.battleSideBox.y;
        spriteMap.rangeButton.y = spriteMap.battleSideBox.y;
    }

    //console.log(battleManager.buttonIdxSelected,idx,battleManager.buttonIdxSelected !== undefined && (arrayEqual(battleManager.buttonIdxSelected,idx)))
    if(battleManager.buttonIdxSelected !== undefined && (arrayEqual(battleManager.buttonIdxSelected,idx))){
        //spriteMap.buttonContainer.alpha = 1.0
        spriteMap[battleManager.buttonKeySelected].alpha = 1.0;
    }
    else{
        ['meleeButton','rangeButton','waitButton','moveButton'].forEach(function(key){
            spriteMap[key].alpha = 0.5;
        })
    }

    //if(unitData.strength>0){
    spriteMap.tag.visible = unitData.strength === 0;
    //}

}

function drawBattleCenterVector(){
    var battleCenterBoxVector = [];
    var battleCenterTextVector = [];

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

    for(var i=0; i<12; i++){
        var name = 'name';

        var color = '#0000ee';
        var text = new PIXI.Text(name, {
            'fill':[color],
            fontSize:10
        });
        text.anchor.set(0.5);
        text.x = 400;
        text.y = 320 + i*20;
        app.stage.addChild(text);
        battleCenterTextVector.push(text);
    }
    
    
    //spriteManager.battleCenterBoxVector = battleCenterBoxVector;
    //spriteManager.battleCenterTextVector = battleCenterTextVector;
    var battleCenterVector = [];
    for(var i=0;i<12;i++){
        battleCenterVector.push({box: battleCenterBoxVector[i], text: battleCenterTextVector[i]});
    }

    var border = new PIXI.Sprite(graphicsTexture.battleCenterBoxSelectedBorder);
    border.anchor.set(0.5);
    border.x = 400;
    border.y = 320 + 0*20;
    app.stage.addChild(border);

    battleCenterVector.border = border; // well, append a attribution into a array may be a wrong idea.

    return battleCenterVector;
}

function updateBattleCenterVector(vectorIdx){
    var cell = spriteManager.battleCenterVector[vectorIdx];
    var idx = battleManager.unitOrder[vectorIdx];

    if(dataMat[idx[0]][idx[1]][idx[2]] === undefined){
        cell.text.text = '';
        cell.box.texture = graphicsTexture.battleCenterBoxNull;
    }
    else{
        cell.text.text = dataMat[idx[0]][idx[1]][idx[2]].name;
        var color = idx[0] === 0 ? '#0000ee' : '#ee0000';
        cell.text.style.fill = [color];
        if(vectorIdx <= battleManager.orderSelected){
            cell.box.texture = graphicsTexture.battleCenterBoxLapsed;
        }
        else{
            cell.box.texture = graphicsTexture.battleCenterBox;
        }
    }

    
}

function drawSideBar(x,y){
    
    //var spriteMap = {}
    
    var sideBarBox = new PIXI.Sprite(graphicsDynamicTexture['sideBarBox'].texture);
    //graphicsDynamicTexture['sideBarBox'].update(p);
    /*
    var spriteText1 = new PIXI.Text(text1, {fontSize:10, fill:['#eeeeee']});
    var spriteText2 = new PIXI.Text(text2, {fontSize:10, fill:['#eeeeee']});
    */
   var spriteText1 = new PIXI.Text('spriteText1', {fontSize:10, fill:['#eeeeee']});
   var spriteText2 = new PIXI.Text('spriteText2', {fontSize:10, fill:['#eeeeee']});
    
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
            //sideBarBoxUpdate: graphicsDynamicTexture['sideBarBox'].update,
            spriteText1: spriteText1,
            spriteText2: spriteText2};
    
}

function updateSideBar(p,text1,text2){
    var spriteMap = spriteManager.factionSpriteMap.sideBar;
    spriteMap.spriteText1.text = text1;
    spriteMap.spriteText2.text = text2;
    graphicsDynamicTexture['sideBarBox'].update(p);
}

function drawFactionGraph(x,y){
    var battleUpperBox = new PIXI.Sprite(graphicsTexture['battleUpperBox']);
    battleUpperBox.x = x;
    battleUpperBox.y = y;
    app.stage.addChild(battleUpperBox);
    
    //var flagAtk = new PIXI.Sprite(PIXI.loader.resources[faction2img[atkInfo['faction']]].texture)
    //var flagDef = new PIXI.Sprite(PIXI.loader.resources[faction2img[defInfo['faction']]].texture)
    var flagAtk = new PIXI.Sprite(PIXI.loader.resources[faction2img['国民政府']].texture)
    var flagDef = new PIXI.Sprite(PIXI.loader.resources[faction2img['国民政府']].texture)
    
    flagAtk.x = 10;
    flagAtk.y = 5;
    
    flagDef.x = 760;
    flagDef.y = 5;
    
    app.stage.addChild(flagAtk);
    app.stage.addChild(flagDef);
    
    var textFactionAtk = new PIXI.Text('textFactionAtk', {fontSize:11});
    
    var textFactionDef = new PIXI.Text('textFactionDef', {fontSize:11});
    
    textFactionAtk.x = 50;
    textFactionAtk.y = 5;
    
    textFactionDef.anchor.set(1.0,0.0)
    textFactionDef.x = 750;
    textFactionDef.y = 5;
    
    
    app.stage.addChild(textFactionAtk);
    app.stage.addChild(textFactionDef);
    
    var sideBar = drawSideBar(x,y);
    //sideBar['sideBarBoxUpdate'](atkInfo['strength'] / (atkInfo['strength'] + defInfo['strength'] + 1.0));
    //var p =0.5
    //updateSideBar(0.5, 'sideBarText1', 'sideBarText2');

    return {
        battleUpperBox: battleUpperBox,
        flagAtk: flagAtk,
        flagDef: flagDef,
        textFactionAtk: textFactionAtk,
        textFactionDef: textFactionDef,
        sideBar: sideBar
    }
    
}

function updateFactionGraph(atkInfo,defInfo, battleInfo){
    var spriteMap = spriteManager.factionSpriteMap;
    spriteMap.flagAtk.texture = PIXI.loader.resources[faction2img[atkInfo['faction']]].texture;
    spriteMap.flagDef.texture = PIXI.loader.resources[faction2img[defInfo['faction']]].texture;
    spriteMap.textFactionAtk.text = '攻方:'+atkInfo['faction'] + '\n补给:'+atkInfo['supply']+'/资金:'+atkInfo['money'];
    spriteMap.textFactionDef.text = '守方:'+defInfo['faction'] + '\n补给:'+defInfo['supply']+'/资金:'+defInfo['money'];
    //spriteMap.sideBar.sideBarBoxUpdate(atkInfo['strength'] / (atkInfo['strength'] + defInfo['strength'] + 1.0));
    var p = atkInfo['strength'] / (atkInfo['strength'] + defInfo['strength'] + 1.0);
    var sideBarText1 = battleInfo['location']+'之战 ['+battleInfo['terrain']+']';
    var sideBarText2 = battleInfo['turn']+'/'+battleInfo['maxTurn']+'回合';
    updateSideBar(p, sideBarText1, sideBarText2);
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
                    //sUnit.x = 20 + j*40-5*i;
                    //sUnit.y = 190 + 15*i;
                    sUnit.x = 0;
                    sUnit.y = 0;
                }
                else{
                    sUnit.scale.x = -1;
                    //sUnit.x = 775 - j*40+5*i;
                    //sUnit.y = 190 + 15*i;
                    sUnit.x = 0;
                    sUnit.y = 0;
                }
                
                app.stage.addChild(sUnit);
                formationMat[t][i].push(sUnit);
            }
        }
    }
    return formationMat
}

function updateFormatMat(){
    // static layout enemy is hidden and ally is displayed in fraction
    var idx = battleManager.unitSelected;
    if(dataMat[idx[0]][idx[1]][idx[2]] === undefined)
        console.log("invalid select")
    //var texture = PIXI.loader.resources[type2img[dataMat[idx[0]][idx[1]][idx[2]]['type']]].texture;
    //var lossCount = Math.floor((1-dataMat[idx[0]][idx[1]][idx[2]]['strength'] / dataMat[idx[0]][idx[1]][idx[2]]['maxStrength'])*20);
    var dUnit = dataMat[idx[0]][idx[1]][idx[2]];
    var lossCount = getLossCount(dUnit.strength, dUnit.maxStrength);
    var sUnit;

    for(var t=0; t<2; t++){
        for(var i=0; i<4; i++){
            for(var j=0; j<5; j++){
                sUnit = spriteManager.formationMat[t][i][j];
                //sUnit.texture = PIXI.loader.resources[type2img[battleManager.formationType[t]]].texture;
                sUnit.texture = PIXI.loader.resources[type2img[dUnit.type]].texture;
                // update visible and texture shown
                if(t !== idx[0]){
                    //spriteManager.formationMat[t][i][j].visible = false; // hide another side
                    sUnit.visible = false;
                }
                else{
                    //spriteManager.formationMat[t][i][j].texture = texture;
                    //spriteManager.formationMat[t][i][j].visible = true;
                    //sUnit.texture = texture;
                    sUnit.visible = true;
                }
                // update(reset) position. In animation another setting will be applied
                if(t===0){
                    sUnit.x = 20 + j*40-5*i;
                    sUnit.y = 190 + 15*i;
                }
                else{
                    //sUnit.scale.x = -1;
                    sUnit.x = 775 - j*40+5*i;
                    sUnit.y = 190 + 15*i;
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

    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0x555555, 1);
    graphics.drawRect(1, 1, 160, 70);

    exports['battleSideBoxNull'] = graphics2texture(graphics);
    
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

    // draw centering name box(null)
    
    graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginFill(0x888888, 1);
    graphics.drawRect(1, 1, 80, 20);
    
    exports['battleCenterBoxNull'] = graphics2texture(graphics);
    
    // draw centering box focus border
    
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
        /*
        var renderer = PIXI.autoDetectRenderer(sideBarWidth, sideBarHeight);
        var stage = new PIXI.Container();
        stage.addChild(graphics);
        //renderer.render(stage);
        var texture = PIXI.Texture.fromCanvas(renderer.view);
        */
       var texture = PIXI.RenderTexture.create(sideBarWidth, sideBarHeight);
       app.renderer.render(graphics, texture);
        
        
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
            //renderer.render(stage);
            //texture.update();
            app.renderer.render(graphics, texture);   
        }
        
        return {texture: texture,
                update: update};
    })();
    
    return exports;
})();

var spriteManager = {}; // this manager will be imported into all sprites

function CombatAnimation(atkIdx, defIdx, atkLoss, defLoss){
    this.atkIdx = atkIdx;
    this.defIdx = defIdx;
    this.atkLoss = atkLoss;
    this.defLoss = defLoss;

    this.runLength = 200;
    this.time = 0.0;
    this.runTime = 30; // if runTime > totalTime, combat(range, melee) animation will not be played
    this.totalTime = 100;

    this.runMark = 0.5; // control unit run range  ---->origin---->(0.5)  ------>origin(1) origin------>(0)

}
CombatAnimation.prototype.preprocess = function(){
    // set all units visible and reset their texture 
    for(let idx of [this.atkIdx, this.defIdx]){
        let t = idx[0];
        for(let i=0; i<4; i++){
            for(let j=0; j<5; j++){
                let sUnit = spriteManager.formationMat[t][i][j];
                let dUnit = dataMat[idx[0]][idx[1]][idx[2]];
                sUnit.visible = true;
                sUnit.texture = PIXI.loader.resources[type2frame[dUnit.type][0]].texture;
            }
        }
    }
}
CombatAnimation.prototype.playing = function(delta){
    console.log('playing', this.time, delta, this.totalTime);
    this.time += delta;
    if(this.time > this.totalTime){
        return false;
    }

    if(this.time < this.runTime){
       this.runningUpdate();
    }
    else{
        this.combatUpdate();
    }
    return true;
}
CombatAnimation.prototype.runningUpdate = function(){
    this.runningUpdatePart(this.atkIdx);
    this.runningUpdatePart(this.defIdx);
}
CombatAnimation.prototype.runningUpdatePart = function(idx){
    var p = this.time/this.runTime;
    var t = idx[0]; // formationMat and dataMat share same idx[0] but not idx[1],idx[2]
    var unit = dataMat[idx[0]][idx[1]][idx[2]];
    var sUnit;
    for(let i=0; i<4; i++){
        for(let j=0; j<5; j++){
            sUnit = spriteManager.formationMat[t][i][j];
            // lossCount will be considered in later code
            //sUnit.visible = true; // this is done by added proprocess method
            if(t === 0)
                sUnit.x = 20 + j*40-5*i + this.runningDelta(p, [t,i,j]);
            else
                sUnit.x = 775 - j*40+5*i - this.runningDelta(p, [t,i,j]);        }
    }

    var lossCount = getLossCount(unit.strength, unit.maxStrength);
    this.diedUpdatePart(p, idx, lossCount);
}
CombatAnimation.prototype.runningDelta = function(p, idx){
    let d = (p - this.runMark) * this.runLength;
    if(idx[0] === this.atkIdx[0])
        d = Math.max(0, d);
    return d;
}
CombatAnimation.prototype.evadeUpdate = function(p){
    for(let t=0; t<2; t++){
        for(let i=0;i<4;i++){
            for(let j=0;j<5;j++){
                let sUnit = spriteManager.formationMat[t][i][j];
                sUnit.y = 190 + 15*i + Math.round(Math.random()*6-3);
            }
        }
    }
}
CombatAnimation.prototype.diedUpdatePart = function(p, idx, lossCount){
    
    var t = idx[0];
    if(lossCount === undefined){
        var unit = dataMat[idx[0]][idx[1]][idx[2]];
        var loss = t === this.atkIdx[0] ? this.atkLoss : this.defLoss;
        lossCount = getLossCount(Math.ceil(unit.strength - loss*p), unit.maxStrength)
    }
    
    for(var j=0; j<5; j++){
        for(var i=3; i>=0; i--){
            if(lossCount<=0)
                break;
            spriteManager.formationMat[t][i][j].visible = false;
            lossCount--;
        }
    }

}
CombatAnimation.prototype.diedUpdate = function(p, atkLossCount, defLossCount){
    this.diedUpdatePart(p, this.atkIdx, atkLossCount);
    this.diedUpdatePart(p, this.defIdx, defLossCount);
}
CombatAnimation.prototype.p2frame = function(p){
    return p % 0.2 < 0.1 ? 0 : 1;
}
CombatAnimation.prototype.frontUpdate = function(p){
    //var fireIdx = p % 0.2 < 0.1 ? 0 : 1;
    var frameIdx = this.p2frame(p);

    // fire!
    for(let idx of [this.atkIdx, this.defIdx]){
        let dUnit = dataMat[idx[0]][idx[1]][idx[2]];
        let t = idx[0];
        for(let i=0;i<4;i++){
            let sUnit = spriteManager.formationMat[t][i][4];
            if(sUnit.visible){
                sUnit.texture = PIXI.loader.resources[type2frame[dUnit.type][frameIdx]].texture;
            }
        }
    }
}
CombatAnimation.prototype.combatUpdate = function(){
    var p = (this.time - this.runTime)/(this.totalTime - this.runTime);

    // front fight!
    this.frontUpdate(p)

    // evade!
    this.evadeUpdate(p);

    // died!
    this.diedUpdate(p);

}

function RangeAnimation(atkIdx, defIdx, loss){
    CombatAnimation.call(this, atkIdx, defIdx, 0, loss);

    this.runLength = 200;
    this.time = 0.0;
    this.runTime = 30;
    this.totalTime = 100;

    this.runMark = 1.0; // control unit run range  ---->origin---->(0.5)  ------>origin(1) origin------>(0)

}
RangeAnimation.prototype = Object.create(CombatAnimation.prototype);
RangeAnimation.prototype.p2frame = function(p){
    return p % 0.2 < 0.1 ? 0 : 1;
}

function MeleeAnimation(atkIdx, defIdx, atkLoss, defLoss){
    CombatAnimation.call(this, atkIdx, defIdx, atkLoss, defLoss);

    this.runLength = 250;
    this.time = 0.0;
    this.runTime = 30;
    this.totalTime = 100;

    this.runMark = 0.3; // control unit run range  ---->origin---->(0.5)  ------>origin(1) origin------>(0)

}
MeleeAnimation.prototype = Object.create(CombatAnimation.prototype);
MeleeAnimation.prototype.p2frame = function(p){
    return p % 0.2 < 0.1 ? 2 : 3;
}

function BackAnimation(idx){
    CombatAnimation.call(this, undefined, undefined, undefined, undefined);
    this.idx = idx;

    this.runLength = 200;
    this.time = 0.0;
    this.runTime = 40;
    this.totalTime = 40;

    this.runMark = 0.0; // control unit run range  ---->origin---->(0.5)  ------>origin(1) origin------>(0)
}
BackAnimation.prototype = Object.create(CombatAnimation.prototype);
BackAnimation.prototype.preprocess = function(){
    // set all units visible and reset their texture 
    var dUnit = dataMat[this.idx[0]][this.idx[1]][this.idx[2]];
    for(let t=0; t<2; t++){
        for(let i=0; i<4; i++){
            for(let j=0; j<5; j++){
                let sUnit = spriteManager.formationMat[t][i][j];
                //sUnit.visible = this.idx[0] === t;
                if(t === this.idx[0]){
                    sUnit.texture = PIXI.loader.resources[type2frame[dUnit.type][0]].texture;
                    sUnit.visible = true;
                }
                else{
                    sUnit.visible = false;
                }
            }
        }
    }
}
BackAnimation.prototype.runningUpdate = function(){
    this.runningUpdatePart(this.idx);
    //this.runningUpdatePart(this.defIdx);
}
BackAnimation.prototype.runningDelta = function(p, idx){
    let d = -(p - this.runMark) * this.runLength;
    return d;
}


var animationManager = {
    _playingList: [],
    playAll:function(delta){
       var newPlayingList = [];
       for(let [callback,resolve,reject] of this._playingList){
            if(callback(delta))
                newPlayingList.push([callback,resolve,reject]);
            else
                resolve();
       }
       this._playingList = newPlayingList;
    },
    setupAnimation: function(a){
        var _resolve, _reject;
        var promise = new Promise(function(resolve, reject){
            _resolve = resolve;
            _reject = reject;
        });
        this._playingList.push([a.playing.bind(a), _resolve, _reject]);
        a.preprocess();
        return promise;
    },
    startRangeAnimation: function(atkIdx, defIdx, loss){
        var a = new RangeAnimation(atkIdx, defIdx, loss);
        return this.setupAnimation(a);
    },
    startMeleeAnimation: function(atkIdx, defIdx, lossA, lossB){
        var a = new MeleeAnimation(atkIdx, defIdx, lossA, lossB);
        return this.setupAnimation(a);
    },
    startBackAnimation: function(idx){
        var a = new BackAnimation(idx);
        return this.setupAnimation(a);
    }
};

var battleManager = {
    unitSelected: [0,1,1], // seleced idx i.e. [0,0,0]
    unitPrevSelected:[0,1,1],
    orderSelected:0,
    //formationType:['民兵','民兵'],
    buttonAvailable:true,
    buttonKeySelected:undefined,
    buttonIdxSeleted:undefined,
    unitOrder:undefined,
    rangeMap:undefined,
    atkInfo:{faction:"国民政府", supply:0, money:0, strength:100},
    defInfo:{faction:"国民政府", supplu:0, money:0, strength:100}, 
    battleInfo:{location: '南京', terrain:'城市', turn:1, maxTurn:45},

    select:function(idx){
        var pidx = this.unitSelected;
        this.unitPrevSelected = pidx;
        this.unitSelected = idx;

        //this.formationType[idx[0]] = dataMat[idx[0]][idx[1]][idx[2]].type;
        
    },
    updateAllUnitBox:function(){
        var idx = this.unitSelected;
        var unitData = dataMat[idx[0]][idx[1]][idx[2]];
        this.rangeMap = makeRange(idx, unitData.type);

        for(var t=0;t<2;t++){
            for(var i=0;i<3;i++){
                for(var j=0;j<2;j++){
                    updateUnitBox([t,i,j]);
                }
            }
        }
    },
    updateAllBattleCenterVector:function(){
        for(var i=0; i<12; i++){
            updateBattleCenterVector(i);
        }
        spriteManager.battleCenterVector.border.y = 320 + this.orderSelected * 20;
    },
    updateAll:function(){
        updateFormatMat();
        this.updateAllBattleCenterVector();
        this.updateAllUnitBox();
        this.updateInfo();
        updateFactionGraph(this.atkInfo, this.defInfo, this.battleInfo);
    },
    updateInfo:function(){
        //this.atkInfo['strength'] = 0;
        //this.defInfo['strength'] = 0;
        var strengths = [0,0];
        for(let t=0; t<2; t++){
            for(let i=0; i<3; i++){
                for(let j=0; j<2; j++){
                    let dUnit = dataMat[t][i][j]
                    if(dUnit !== undefined){
                        strengths[t] += dUnit.strength *(dUnit.I + dUnit.W + dUnit.B) * (1+dUnit.buff);
                    }
                }
            }
        }
        this.atkInfo['strength'] = strengths[0];
        this.defInfo['strength'] = strengths[1];
    },
    swap: function(idx){
        var cidx = [idx[0], idx[1], 1-idx[2]];
        //var cidx = this.unitSelected;
        var dUnit = dataMat[idx[0]][idx[1]][idx[2]];
        var cdUnit = dataMat[cidx[0]][cidx[1]][cidx[2]];
        dataMat[idx[0]][idx[1]][idx[2]] = cdUnit;
        dataMat[cidx[0]][cidx[1]][cidx[2]] = dUnit;

        for(let i=0; i<12; i++){
            if(arrayEqual(this.unitOrder[i], cidx)){
                this.unitOrder[i] = idx;
            }
            else if(arrayEqual(this.unitOrder[i], idx)){
                this.unitOrder[i] = cidx;
            }
        }
    },
    substituteSwap: function(iB){
        if( iB[2] === 1 && // in frontline
            dataMat[iB[0]][iB[1]][iB[2]].strength === 0 && // broken
            (dataMat[iB[0]][iB[1]][1-iB[2]] != undefined && dataMat[iB[0]][iB[1]][1-iB[2]].strength>0)){ // exist valid substitude
            this.swap(iB);
        }
    },
    battleInit:function(){
        /*
        this.orderSelected = 0;
        this.select(this.unitOrder[0]);
        this.battleInfo.turn+=1;

        this.updateAll();
        */
       this.orderSelected = -1;
       this.findNextUnit();
    },
    newRound:function(){
        // this should do rount init logic
    },
    nextUnit:function(){
        //this.battleInfo.turn += 1;
        if(this.battleInfo.turn > this.battleInfo.maxTurn){
            console.log("battle end TODO...");
            // TODO
        }
        var idx = this.unitOrder[this.orderSelected+1]
        if(dataMat[idx[0]][idx[1]][idx[2]] === undefined){
            this.newRound();

            this.orderSelected = 0;
            this.select(this.unitOrder[0]);
            this.battleInfo.turn+=1;
            //return;
        }
        else{
            this.orderSelected += 1;
            this.select(idx);
            this.battleInfo.turn += 1;
        }
        
        this.updateAll();
    },
    findNextUnit: async function(){
        // find next unit who can be assigned with non-verbose command
        while(true){
            this.nextUnit();
            let idx = this.unitSelected;
            let dUnit = dataMat[idx[0]][idx[1]][idx[2]];
            if(dUnit.strength === 0)
                continue;
            //if(isAllFalse([this.rangeMap.melee, this.rangeMap.range, this.rangeMap.move])){
                if(isAllFalse([this.rangeMap.melee, this.rangeMap.range])){
                await this._waitButton(idx);
                continue;
            }
            return;
        }
    },
    onButtonDown: function(key, idx){
        console.log('onButtonDown',key,idx);
        this[key](idx); // dispatch to other handlers with key name
    },
    onButtonUp:function(key, idx){
        console.log('onButtonUp',key,idx);
    },
    onButtonOver:function(key, idx){
        console.log('onButtonOver',key,idx);
        if(['meleeButton','rangeButton','waitButton','moveButton'].indexOf(key) !== -1){
            this.buttonKeySelected = key;
            this.buttonIdxSelected = idx;
        }
        else{
            console.log("unknown",key,idx);
        }
        this.updateAllUnitBox();
    },
    onButtonOut:function(key, idx){
        console.log('onButtonOut',key,idx);
        this.buttonKeySelected = undefined;
        this.buttonIdxSelected = undefined;
        this.updateAllUnitBox();
    },
    meleeButton: async function(idx){
        console.log(this.unitSelected+'will attack(melee) '+idx);
        var iA = this.unitSelected;
        var iB = idx;
        var aLoss,bLoss;
        [aLoss,bLoss] = meleeDamage(iA, iB);

        this.buttonAvailable = false;
        //this.formationType[idx[0]] = dataMat[idx[0]][idx[1]][idx[2]].type;
        this.updateAll();
        await animationManager.startMeleeAnimation(iA, iB, aLoss, bLoss);
        this.buttonAvailable = true;
        console.log("animation end");

        dataMat[iB[0]][iB[1]][iB[2]].strength -= bLoss;
        dataMat[iA[0]][iA[1]][iA[2]].strength -= aLoss;
        if(dataMat[iA[0]][iA[1]][iA[2]].morale >=1)
            dataMat[iA[0]][iA[1]][iA[2]].morale -=1;
        this.substituteSwap(iA);
        this.substituteSwap(iB);
        
        this.findNextUnit();

    },
    rangeButton: async function(idx){
        console.log(this.unitSelected+'will attack(range) '+idx);
        var iA = this.unitSelected;
        var iB = idx;
        //var unitA = dataMat[iA[0]][iA[1]][iA[2]];
        //var unitB = dataMat[iB[0]][iB[1]][iB[2]];
        var damage = rangeDamage(iA, iB);

        this.buttonAvailable = false;
        //this.formationType[idx[0]] = dataMat[idx[0]][idx[1]][idx[2]].type;
        this.updateAll();
        await animationManager.startRangeAnimation(iA, iB, damage);
        this.buttonAvailable = true;
        console.log("animation end");

        dataMat[iB[0]][iB[1]][iB[2]].strength -= damage;
        if(dataMat[iA[0]][iA[1]][iA[2]].morale >=1)
            dataMat[iA[0]][iA[1]][iA[2]].morale -=1;
        this.substituteSwap(iB);

        
        this.findNextUnit();

    },
    moveButton: async function(idx){
        console.log(this.unitSelected+'will replace its position with'+idx);

        this.buttonAvailable = false;
        this.updateAll();
        //await animationManager.startBackAnimation(idx);
        await animationManager.startBackAnimation(this.unitSelected);
        this.buttonAvailable = true;
        console.log("animation end");

        this.swap(this.unitSelected);

        /*
        //var cidx = [idx[0], idx[1], 1-idx[2]];
        var cidx = this.unitSelected;
        var dUnit = dataMat[idx[0]][idx[1]][idx[2]];
        var cdUnit = dataMat[cidx[0]][cidx[1]][cidx[2]];
        dataMat[idx[0]][idx[1]][idx[2]] = cdUnit;
        dataMat[cidx[0]][cidx[1]][cidx[2]] = dUnit;

        for(let i=0; i<12; i++){
            if(arrayEqual(this.unitOrder[i], cidx)){
                this.unitOrder[i] = idx;
            }
            else if(arrayEqual(this.unitOrder[i], idx)){
                this.unitOrder[i] = cidx;
            }
        }
        */

        this.findNextUnit();

    },
    waitButton: async function(idx){
        console.log(this.unitSelected+'will zzz');
        var unitData = dataMat[idx[0]][idx[1]][idx[2]];

        this.buttonAvailable = false;
        this.updateAll();
        await animationManager.startBackAnimation(idx);
        this.buttonAvailable = true;
        console.log("animation end");

        if(unitData.morale < unitData.maxMorale){
            unitData.morale += 1;
        }
        this.findNextUnit();
    },
    _waitButton: async function(idx){
        console.log(this.unitSelected+'will zzz');
        var unitData = dataMat[idx[0]][idx[1]][idx[2]];

        this.buttonAvailable = false;
        this.updateAll();
        await animationManager.startBackAnimation(idx);
        this.buttonAvailable = true;
        console.log("animation end");

        if(unitData.morale < unitData.maxMorale){
            unitData.morale += 1;
        }
    }
}



function gameLoop(delta){
    //console.log(delta);
    // play animation
    /*
    for(let callback of animationManager.playingList){
        callback();
    }
    */
   animationManager.playAll(delta);
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
    
    for(let t=0;t<2;t++){
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
        for(let i=0; i<3; i++){
            spriteMat[t].push([]);
            for(let j=0; j<2; j++){
                spriteMat[t][i][j] = drawUnitBox(sm_x + step_x*j, sm_y + step_y*i, t === 0);
                // binding button related event
                ['meleeButton','rangeButton','waitButton','moveButton'].forEach(function(key){
                    var button = spriteMat[t][i][j][key];
                    button.interactive = true;
                    //button.buttonMode = true; // turn off hand icon
                    button
                        .on('pointerdown', function(){
                            battleManager.onButtonDown(key,[t,i,j])
                        }) // button will be denoted as `this` in callback function onButtonDown etc.
                        .on('pointerup', function(){
                            battleManager.onButtonUp(key,[t,i,j]);
                        })
                        .on('pointerupoutside', function(){
                            battleManager.onButtonUp(key,[t,i,j]);
                        })
                        .on('pointerover', function(){
                            battleManager.onButtonOver(key,[t,i,j]);
                        })
                        .on('pointerout', function(){
                            battleManager.onButtonOut(key,[t,i,j]);
                        });
                })
            }
        }
    }
    
    spriteManager.spriteMat = spriteMat;
    
    
    // draw centering labels
    spriteManager.battleCenterVector = drawBattleCenterVector();

    var pots = {};
    var I;
    for(var t=0;t<2;t++){
        for(var i=0;i<3;i++){
            for(var j=0;j<2;j++){
                if(dataMat[t][i][j] === undefined){
                    I = undefined;
                }
                else{
                    I = dataMat[t][i][j]['I'];
                }
                if(pots[I]){
                    pots[I].push([t,i,j]);
                }
                else{
                    pots[I] = [[t,i,j]]
                }
            }
        }
    }
    var idxs = Object.keys(pots).map(function(sn){
        if(sn === "undefined")
            return undefined;
        return Number(sn)
    });
    idxs.sort(function(x,y){return x<y});
    var unitOrder = [];
    idxs.forEach(function(idx){
        var arr = pots[idx];
        shuffle(arr);
        unitOrder = unitOrder.concat(arr);
    });

    battleManager.unitOrder = unitOrder;
    
    // draw formation UI
    spriteManager.formationMat = drawFormationMat();
    
    
    // draw up bar
    var factionSpriteMap = drawFactionGraph(0,0);
    
    spriteManager.factionSpriteMap = factionSpriteMap;

    battleManager.atkInfo.faction = '国民政府';
    battleManager.atkInfo.supply = 13;
    battleManager.atkInfo.money = 75;
    battleManager.atkInfo.strength = 700;

    battleManager.defInfo.faction = '川康军';
    battleManager.defInfo.supply = 1;
    battleManager.defInfo.money = 4;
    battleManager.defInfo.strength = 800;

    battleManager.battleInfo.location = '自贡';
    battleManager.battleInfo.terrain = '山丘';
    battleManager.battleInfo.turn = 1;
    battleManager.battleInfo.maxTurn = 45;


    //updateFactionGraph(battleManager.atkInfo, battleManager.defInfo, battleManager.battleInfo);
    
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
    
    
    //battleManager.newRound();
    battleManager.battleInit();
    
    
    //formationManager.reset();
    
    app.ticker.add(gameLoop);
}

// setup will called in later script