
exports.pointCalculate = (total) => {
    if(total>=100)
        return Math.floor(total/100)
    else
        return 0
}

exports.totalCalculate = (cart) => {
    let total=0;
    if(cart){
        for(var i=0;i<cart.length;i++){
            total+=cart[i].goodsSubTotal
        }
    }
    return total;
}

exports.searchCart = (cart, request) => {
    for(var i=0; i<cart.length;i++){
        if(cart[i].goodsName==request){
            return i;
        }
    }
    return -99;
}

exports.sponsorIncome = (sponsored) => {
    var result=0
    sponsored.forEach((e)=>{
        result++
    })
    return result*400;
}

exports.childIncome = (child) => {
    var result=0
    if(child){
        result=200
    }
    return result
}

exports.emptySlot = (tree) => {
    var result=32
    tree.forEach((e)=>{
        if(e.lev6){result-=1}
    })
    if(result>32){result='>32'}
    return result
}

