
exports.pointCalculate = (total) => {
    if(total>=100)
        return Math.floor(total%100)
    else
        return 0
}

exports.totalCalculate = (cart) => {
    let total=0;
    cart.forEach((element) => {   
        total+=element.goodsSubTotal
    })
    return total;
}