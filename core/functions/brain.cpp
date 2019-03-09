#include <nan.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>

using namespace std;

string getResponse(string inputSentance) {
    return "";
}

void start() {

}

void loadAxons() {

}

void loadNeurons() {

}

void saveBrain() {

}

void addToBrain(string header, string child) {

}

/**
 * What are these here for?
 * 
 * Well, to answer your question. It is alot faster for cpp to
 * handle all the brain work over javascript.
 * 
 * It also uses less memory.
 * 
 * So these are here to provide access to the brain that has been created on launch.
 **/

/**
 * The reason we aren't making all of methods, nan methods...
 * Is simply because, we dont want to pass it back to javascript at all.
 * We also dont want the garbage collector to get in our way.
 **/
NAN_METHOD(startBrain)
{
    start();
}

NAN_METHOD(workOut) {
    if (!info[0]->IsString()) {
        Nan::ThrowTypeError("argument must be a string!");
        return;
    }

    v8::String::Utf8Value raw(info[0]);
    string _input(*raw);

    string result = getResponse(_input);


    info.GetReturnValue().Set(Nan::New(result).ToLocalChecked());
}

NAN_MODULE_INIT(Initialize)
{
    NAN_EXPORT(target, startBrain);
    NAN_EXPORT(target, workOut);
}

NODE_MODULE(brain, Initialize);