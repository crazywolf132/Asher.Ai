module.exports=(function(Asher){
    var queries=[];
    queries.push([/(?:what is|what's)\s(\d+)\s(\+|plus|times|-|minus|\/|divided by|\*|multiplied by)?\s(\d+)/i,function(args){
        var num1=args[1];
        var method=args[2];
        var num2=args[3];
        var type=null;
        switch(method){
            case "+":
                type="add";
                break;
            case "plus":
                type="add";
                break;
            case "-":
                type="subtract";
                break;
            case "minus":
                type="subtract";
                break;
            case "/":
                type="divide";
                break;
            case "divided by":
                type="divide";
                break;
            case "*":
                type="multiply";
                break;
            case "times":
                type="multiply";
                break;
            case "multiplied by":
                type="multiply";
                break;
            default:
                type=type;
                break;
        }
        return {
            status:"result",
            answer:Asher.processCommand("math",[type,num1,num2]).answer
        };
    }]);
    Asher.addNatural=(function(rr,fun){
        queries.push([rr,fun]);
    });
    Asher.addCommand("natural",function(args){
        try{
            var query=args[0];
        }catch(e){
            return {
                status:"fail",
                error:"Please provide a query!"
            };
        }
        var output="I have nothing to say. :(";
        for(var i=0;i<queries.length;i++){
            var out=queries[i][1](queries[i][0].exec(query));
            if(out.status!==undefined){
                return out;
            }
        }
        return {
            status:"success",
            result:output
        };
    });
});