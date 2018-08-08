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

function arrayEqual(a,b){
    if(a.length !== b.length)
        return false;
    for(var i=0; i< a.length; i++){
        if(a[i] !== b[i])
            return false;
    }
    return true;
}