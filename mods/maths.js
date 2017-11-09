module.exports=(function(Asher){
    console.log(Asher);
    Asher.addCommand("math",function(args){
        var choice=args[0]||"~";
        try{
            var number_one=parseInt(args[1]);
        }catch(e){
            return {status:"fail",error:"Number 1 missing!"};
        }
        try{
            var number_two=parseInt(args[2]);
        }catch(e){
            return {status:"fail",error:"Number 2 missing!"};
        }
        switch(choice){
            case "divide":
                return {
                    status:"answer",
                    answer:number_one/number_two
                };
            case "multiply":
                return {
                    status:"answer",
                    answer:number_one*number_two
                };
            case "add":
                return {
                    status:"answer",
                    answer:number_one+number_two
                };
            case "subtract":
                return {
                    status:"answer",
                    answer:number_one-number_two
                };
            default:
                return {
                    status:"choice",
                    choices:["add","subtract","divide","multiply"]
                };
        }
    });
});
