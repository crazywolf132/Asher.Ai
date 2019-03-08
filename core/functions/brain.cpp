#include <nan.h>
#include <iostream>
#include <fstream>

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
NAN_METHOD(startBrain)
{
    testMe();
}

NAN_MODULE_INIT(Initialize)
{
    NAN_EXPORT(target, startBrain);
}

NODE_MODULE(brain, Initialize);