import os, sys

_cur_dir = os.getcwd()
_entered = "/mods/"

def main():
    global _entered
    # We will be inside of the mods directory...
    _dirs = os.listdir( _cur_dir + _entered )
    for folder in _dirs:
        # We are now going to go inside each mod...
        _entered = "/mods/" + folder
        # We now need to delete the unneeded files...
        _hold_type = ""
        toDelete = ['type.txt']
        for item in toDelete:
            with open("{0}{1}/{2}".format(_cur_dir, _entered, item), 'r') as readIt:
                for line in readIt:
                    _line = line.split("\n")
                    _hold_type = _line[0]
            os.remove("{0}{1}/{2}".format(_cur_dir, _entered, item))
        with open("{0}{1}/{2}".format(_cur_dir, _entered, "info.mod"), 'w') as out:
            out.write(folder + "\n")
            out.write("Crazywolf132\n")
            out.write(_hold_type + "\n")

main()