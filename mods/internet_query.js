module.exports=(function(Asher){
    Asher.addCommand("query",function(args){
        try{
            var question=args[0];
        }catch(e){
            return {
                status:"fail",
                error:"No question given!"
            };
        }
        var expression=/(Find information about |Tell me about |What is\s?[an]*\s(?!the)|What are )([^\d]+)/i;
        var query=expression.exec(question);
        try{
            var search=query[0];
        }catch(e){
            return {
                status:"fail",
                error:"Please provide a better question!"
            };
        }
        search=serch.replace(/\s/gim,"%20"); // replace spaces with the encoded url space
        var request_url=`http://api.duckduckgo.com/?q=Where%20is%20${search}&format=json&pretty=1`;
        Asher.request(request_url,function(error,response,body){
            if(!error&&respnase.statusCode===200){
                var body = JSON.parse(body);
                if ( body.Abstract ){
                    return {
                        status:"success",
                        result:body.Abstract
                    };
                }else{
                    return {
                        status:"fail",
                        error:`I'm sorry I couldn't find any information about "${question}"`
                    };
                }
            }
        });
    });
});