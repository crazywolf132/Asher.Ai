#include <nan.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <iterator>
#include <sstream>
#include <algorithm>
#include <time.h>

using namespace std;

map< string, vector<string> > associationsDB;

string getResponse(string inputSentance) {
    return "";
}

string trim(const string& str, const string& whitespace = " \t", bool returnWhole = false) {
    const auto strBegin = str.find_first_not_of(whitespace);
    if (strBegin == string::npos){
        return (returnWhole ? str : ""); // no content
    }

    const auto strEnd = str.find_last_not_of(whitespace);
    const auto strRange = strEnd - strBegin + 1;

    return str.substr(strBegin, strRange);
}

bool inMap(const string& str, const map<string, vector<string>>& m) {
    auto search = m.find(str);
    return search != m.end();
}

bool inVector(const string& str, const vector<string>& m) {
    return (find(m.begin(), m.end(), str) != m.end());
}

void loadAxons() {
    cout << "Now loading Neurons..." << endl;
    // We are assuming we are in the root directory.
    ifstream f("./brain/asher.brain");
    if (f.good()) { // This means the file exists.
        clock_t tStart = clock();
        int counter = 0;
        vector<string> lines;
        string currentLine = "";
        while(getline(f, currentLine)) {
            // This is where we decide what to do with each line
            // of the file we are reading.
            lines.push_back(currentLine);
        }

        for (auto item : lines) {
            // Working with each line to read the brain.
            vector<string> line_part;
            stringstream ss(item);
            string token;
            while(getline(ss, token, ':')) {
                token = trim(token);
                line_part.push_back(token);
            }
            string header = trim((string) line_part.at(0), ".", true);
            string response = (string) line_part.at(1);

            if (inMap(header, associationsDB)) {
                if (!inVector(response, associationsDB.at(header))) {
                    // The response is not known to the header.
                    // Adding it to the known responses now.
                    (associationsDB.at(header)).push_back(response);
                }
            } else {
                vector<string> blank;
                associationsDB.insert(pair<string, vector<string>>(header, blank));
                // associationsDB[header] = vector<string>
                (associationsDB.at(header)).push_back(response);
            }

            if (counter % 10000 == 0) {
                cout << "Loaded " << counter << "iterations..." << endl;
            }
            counter++;
        }
        cout << "Finished with " << counter << " TOTAL ITERATIONS" << endl;
        printf("Time taken: %.2fs\n", (double)(clock() - tStart) / CLOCKS_PER_SEC);
        associationsDB = map<string, vector<string>>();
    } else { // We are going to have to manually load all the training files.

    }
}

void loadNeurons() {

}

void saveBrain() {

}

void addToBrain(string header, string child) {

}

void start() {
    loadAxons();
    loadNeurons();
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

    Nan::Utf8String raw(info[0]);
    int len = raw.length();
    if (len <= 0) {
        return Nan::ThrowTypeError("argument must be a non-empty string");
    }

    string _input(*raw, len);

    string result = getResponse(_input);

    info.GetReturnValue().Set(Nan::New(result).ToLocalChecked());
}

NAN_MODULE_INIT(Initialize)
{
    NAN_EXPORT(target, startBrain);
    NAN_EXPORT(target, workOut);
}

NODE_MODULE(brain, Initialize);