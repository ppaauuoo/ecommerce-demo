
exports.pointCalculate = (total) => {
    if(total>=100)
        return Math.floor(total%100)
    else
        return 0
}

exports.totalCalculate = (cart) => {
    let total=0;
    for(var i=0;i<cart.length;i++){
        total+=cart[i].goodsSubTotal
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