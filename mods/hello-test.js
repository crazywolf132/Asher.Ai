module.exports=(function(Asher){
    Asher.addNatural(/(?:hi|hello|hey)/i,function(){
        return {
            status:"success",
            result:"Hello to you too."
        };
    });
});