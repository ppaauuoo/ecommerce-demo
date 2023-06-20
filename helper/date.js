exports.getDate = ()=> {
    const today = new Date();
    const options = {
        day: "numeric",
        month: "short",
        year: "numeric"
    }
    return today.toLocaleDateString("th-TH", options)
}

exports.getDay = () =>{
    const today = new Date();
    const options = {
        weekday: "long"
    }
    return today.toLocaleDateString("en-US", options)
}
