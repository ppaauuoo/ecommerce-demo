
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

// exports.childIncome = (child) => {
//     var result=0
//     if(child){
//         result=200
//     }
//     return result
// }

exports.childIncome = (tree) => {
    const Child = tree
    const lev2Array = [...new Set(Child.map(item => item.lev2))].length;
    const lev3Array = [...new Set(Child.map(item => item.lev3))].length;
    const lev4Array = [...new Set(Child.map(item => item.lev4))].length;
    const lev5Array = [...new Set(Child.map(item => item.lev5))].length;
    const lev6Array = Child.length
    var result = 0
    result += lev2Array+lev3Array+lev4Array+lev5Array+lev6Array
    result = Math.floor(result/2)
    result = Math.floor(result/5)
    result *= 200
    return result
}

exports.emptySlot = (tree) => {
    var result=32
    tree.forEach((e)=>{
        if(e.lev6){result-=1}
    })
    if(result==32){result='>=32'}
    return result
}

exports.idGenerator = () => {
    const d = new Date();
    return d.valueOf();
}

exports.getTotalFromCart = (UserCart) =>{
    var total = 0;
    UserCart.forEach((e) => {
        total += e.goodsPrice * e.quantity;
    });
    return total
}



