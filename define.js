var _type2img = {
    '骑兵':'002',
    '新军步兵':'131',
    '民兵':'000',
    '黄埔步兵':'001',
    '炮兵':'003'
}
/*
var type2img = {
    '骑兵':'unit-002-0.png',
    '新军步兵':'unit-131-0.png',
    '民兵':'unit-000-0.png',
    '黄埔步兵':'unit-001-0.png',
    '炮兵':'unit-003-0.png'
}
*/
type2img = {};
type2frame = {};
for(let type in _type2img){
    type2img[type] = 'unit-'+_type2img[type]+'-0.png'; 
    type2frame[type] = [];
    for(let i=0;i<4;i++){
        type2frame[type].push('unit-'+_type2img[type]+'-'+i+'.png'); 
    }
}


/*
none:无攻击
forward:正前方，在第一排时可以攻击相对位置的敌方单位，若该线被全部击溃或不存在则可攻击其他两线第一排
line:前排所有，在一排时可以攻击对方第一排所有单位
shock:后排可攻，在第一排时可攻击对方所有单位，在后排时刻攻击第一排所有单位
all:敌全体，在任意位置均可攻击所有单位
*/
var type2range = {
    '骑兵':{range:'forward', melee:'shock'},
    '新军步兵':{range:'line', melee: 'forward'},
    '民兵':{range:'forward',melee:'forward'},
    '黄埔步兵':{range:'line',melee:'forward'},
    '炮兵':{range:'all',melee:'none'}
}

var faction2img = {
    '国民政府':'flag-3-0.png',
    '川康军':'flag-78-0.png'
}