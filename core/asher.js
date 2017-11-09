Asher=(function(){
    var internals={};
    var externals={};
    internals.commands={};
    externals.addCommand=(function(command,fun,choices,){
        internals.commands[command]={
            call:fun
        };
    });
    externals.processCommand=(function(command,args){
        if(internals.commands[command]!==undefined){
            return internals.commands[command].call(args);
        }else{
            return {
                status:"fail",
                error:"Invalid command!"
            };
        }
    });
    return externals;
});
module.exports=Asher;