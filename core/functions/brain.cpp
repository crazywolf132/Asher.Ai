#include <nan.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <map>
#include <iterator>
#include <sstream>
#include <algorithm>

using namespace std;

map< string, vector<string> > associationsDB;

typedef std::vector<std::string> stringvec;

int random_int(int min, int max)
{
   return rand()%(max-min+1) + min;
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

bool inMap(const string& str, const map<string, stringvec>& m) {
    auto search = m.find(str);
    return search != m.end();
}

bool inVector(const string& str, const stringvec& m) {
    return (find(m.begin(), m.end(), str) != m.end());
}

string getResponse(string inputSentance) {
    if (inMap(inputSentance, associationsDB)) {
        stringvec l = (associationsDB.at(inputSentance));
        return l[random_int(0, l.size() - 1)];
    }
    return "-1";
}

void read_directory(const string& name, stringvec& v, const string& searchFor = "")
{
    DIR* dirp = opendir(name.c_str());
    struct dirent * dp;
    while ((dp = readdir(dirp)) != NULL) {
        string str = dp->d_name;
        if (str.find(searchFor) != string::npos) {
            v.push_back(str);
        }
    }
    closedir(dirp);
}


void loadAxons() {
    cout << "Now loading Neurons..." << endl;
    // We are assuming we are in the root directory.
    ifstream f("./brain/asher.brain");
    if (f.good()) { // This means the file exists.
        int counter = 0;
        stringvec lines;
        string currentLine = "";
        while(getline(f, currentLine)) {
            // This is where we decide what to do with each line
            // of the file we are reading.
            lines.push_back(currentLine);
        }

        for (auto item : lines) {
            // Working with each line to read the brain.
            stringvec line_part;
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
                stringvec blank;
                associationsDB.insert(pair<string, stringvec>(header, blank));
                // associationsDB[header] = vector<string>
                (associationsDB.at(header)).push_back(response);
            }

            if (counter % 10000 == 0) {
                cout << "Loaded " << counter << " iterations..." << endl;
            }
            counter++;
        }
        cout << "Finished with " << counter << " TOTAL ITERATIONS" << endl;

    } else { // We are going to have to manually load all the training files.
        //std::experimental::filesystem::recursive_directory_iterator
        stringvec v;
        read_directory("./training_data", v, ".yml");

        int counter = 0;
        for (string file : v) {

            // Opening the file.
            ifstream f("./training_data/" + file);
            if (f.good()) { // This means the file successfully loaded
                stringvec lines;
                string currentLine = "";
                while(getline(f, currentLine)) {
                    lines.push_back(currentLine);
                }

                string lastHeader = "";

                for (string item : lines) {
                    if (item.find("- - ") != string::npos) {
                        string holder = trim(item, "- - ", true);
                        holder = trim(holder, "?", true);
                        holder = trim(holder, ".", true);
                        holder = trim(holder);

                        lastHeader = holder;
                    } else if (item.find("  - ") != string::npos) {
                        string holder = trim(item, "  - ", true);
                        holder = trim(holder);

                        if (inMap(lastHeader, associationsDB)) {
                            if (!inVector(lastHeader, associationsDB.at(lastHeader))) {
                                (associationsDB.at(lastHeader)).push_back(holder);
                            }
                        } else {
                            stringvec blank;
                            associationsDB.insert(pair<string, stringvec>(lastHeader, blank));
                            (associationsDB.at(lastHeader)).push_back(holder);
                        }
                    }
                    if (counter % 10000 == 0) {
                        cout << "Loaded " << counter << " neurons..." << endl;
                    }
                    counter++;
                }
            }
        }
        cout << "FINISHED WITH " << counter << " TOTAL NEURONS" << endl;
    }
}

void loadNeurons() {

}

void saveBrain() {
    // We are going to change how the brain saves its state.
    // It used to save as a JSON object in a file. But that simply wont do for us anymore.
    // We are going to save it like this:
    // phrase : response

    // We are going to create a vector of lines to write out to the file. This will cause more
    // memory to be used during this process, but it will be more accurate.
    stringvec _out;
    for (auto item : associationsDB) {
        for (auto response : item.second) {
            _out.push_back(item.first + " : " + response);
        }
    }

    ofstream output_file("./brain/asher.brain");
    ostream_iterator<string> output_iterator(output_file, "\n");
    copy(_out.begin(), _out.end(), output_iterator);

    // Clearing this from the memory.
    _out = {};
}

void addToBrain(string header, string child) {

}

void start() {
    loadAxons();
    loadNeurons();
    saveBrain();
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

NAN_METHOD(arrayTester) {
    Nan::Utf8String raw(info[0]);

    vector<string> parts;

    string _input(*raw, raw.length());

    stringstream ss(_input);
    string token;

    while (getline(ss, token, ',')) {
        token = trim(token);
        parts.push_back(token);
    }

    cout << _input << endl;
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
    NAN_EXPORT(target, arrayTester);
}

NODE_MODULE(brain, Initialize);
